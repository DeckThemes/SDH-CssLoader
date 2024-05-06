import os, re, uuid, asyncio, json, aiohttp, time
from typing import List
from css_utils import get_theme_path, Log, Result, PLATFORM_WIN
import css_inject

MAX_QUEUE_SIZE = 500

class BrowserTabHook:
    def __init__(self, browserHook, sessionId : str, targetInfo : dict):
        self.id = targetInfo["targetId"]
        self.type = targetInfo["type"]
        self.title = targetInfo["title"]
        self.url = targetInfo["url"]
        self.sessionId = sessionId
        self.hook = browserHook
        self.pending_add = {}
        self.pending_remove = []
        self.init_done = False
        self.html_classes = []
        asyncio.create_task(self._init())

    async def _init(self):
        res = await self.evaluate_js("(function(){ return {\"title\": document.title, \"classes\": Array.from(document.documentElement.classList).concat(Array.from(document.body.classList)).concat(Array.from(document.head.classList))} })()")

        if res != None:
            self.title = res["title"]
            self.html_classes = res["classes"]
        else:
            Log(f"Failed to connect to tab with id {self.id}")
            self.hook.connected_tabs.remove(self)
            return

        self.init_done = True
        Log(f"Connected to tab: {self.title}")
        await self.health_check()

    async def evaluate_js(self, js, run_async=False, get_result=True):
        try:
            res = await self.hook.send_command("Runtime.evaluate", {
                "expression": js, 
                "userGesture": True, 
                "awaitPromise": run_async,
                "returnByValue": True,
                }, self.sessionId, get_result)
        
            if "result" in res and "result" in res["result"]:
                if "value" in res["result"]["result"]:
                    res = res["result"]["result"]["value"]
                elif "type" in res["result"]["result"] and res["result"]["result"]["type"] == "undefined":
                    res = "Undefined"
                else:
                    res = None
            else:
                res = None

        except:
            res = None
            pass

        return res
    
    async def has_element(self, element_name):
        res = await self.evaluate_js(f"document.getElementById('{element_name}') != null")

        return res if res != None else False

    def compare(self, tab_name : str) -> bool:
        if tab_name.startswith("~") and tab_name.endswith("~") and len(tab_name) > 2:
            if tab_name[1:-1] in self.url:
                return True
        elif tab_name.startswith("!"):
            if tab_name[1:] in self.html_classes:
                return True
        elif re.match(f"^({tab_name})$", self.title):
            return True
        
        return False
    
    async def force_reinject(self) -> Result:
        for inject in css_inject.ALL_INJECTS:
            if inject.enabled:
                for x in inject.tabs:
                    if self.compare(x):
                        await inject.inject_with_tab(self)
                        break

        await self.commit_css_transaction(remove_all_first=True)    

    async def health_check(self) -> Result:
        if not self.init_done:
            return Result(True)

        try:
            if not await self.has_element("test_css_loaded"):
                await self.evaluate_js(
                    f"""
                    (function() {{
                        const elem = document.createElement('div');
                        elem.id = "test_css_loaded";
                        document.head.append(elem);
                    }})()
                    """) 
                
                if not await self.has_element("test_css_loaded"):
                    raise Exception("a variable was injected but cannot be found when retrieved")
                
                await self.force_reinject()

        except Exception as e:
            return Result(False, str(e))
        
        return Result(True)
    
    async def inject_css(self, css : str, id : str = None) -> Result:
        if id == None:
            id = str(uuid.uuid4())

        self.pending_add[id] = css
        return Result(True, id)
    
    async def remove_css(self, css_id : str) -> Result:
        if css_id in self.pending_add:
            del self.pending_add[css_id]
        else:
            self.pending_remove.append(css_id)

        return Result(True)

    async def commit_css_transaction(self, retry : int = 3, remove_all_first : bool = False) -> Result:
        pending_add = self.pending_add
        pending_remove = self.pending_remove

        if len(pending_add) + len(pending_remove) == 0:
            return Result(True)

        self.pending_add = {}
        self.pending_remove = []
        Log(f"Committing css transaction on {self.title} +{len(pending_add)} -{len(pending_remove)}")

        data = {
            "add": [{"id": x, "css": pending_add[x]} for x in pending_add],
            "remove": pending_remove
        }

        try:
            data_str = json.dumps(data)
        except Exception as e:
            Result(False, str(e))

        extra_js = ""

        if remove_all_first:
            extra_js = "document.querySelectorAll('.css-loader-style').forEach(x => x.remove());"

        js = f"""
        (function() {{
            let css_data = {data_str};

            {extra_js}

            css_data.add.forEach(x => {{
                if (document.getElementById(x.id) !== null){{
                    return;
                }}

                let style = document.createElement('style');
	            style.id = x.id;
                style.classList.add('css-loader-style');
	            document.head.append(style);
	            style.textContent = x.css;
            }});
            
            css_data.remove.forEach(x => {{
                let style = document.getElementById(x);
                style?.parentNode.removeChild(style);
            }});
        }})()
        """

        while (retry > 0):
            retry -= 1
            res = await self.evaluate_js(js)
            if res != None:
                return res
            else:
                Log("Transaction failed! retrying in 0.2 seconds")
                await asyncio.sleep(0.2)

        return Result(False, "Css Commit Retry Count Exceeded")
    
    async def remove_all_css(self, retry : int = 3) -> Result:
        js = """
        (function() {
            document.querySelectorAll('.css-loader-style').forEach(x => x.remove());
        })()
        """

        self.pending_add = {}
        self.pending_remove = []

        while (retry > 0):
            retry -= 1
            res = await self.evaluate_js(js)
            if res != None:
                return res
            else:
                Log("Transaction failed! retrying in 0.2 seconds")
                await asyncio.sleep(0.2)

        return Result(False, "Css Commit Retry Count Exceeded")

class BrowserHook:
    def __init__(self):
        Log("Initializing hook")
        self.client = None
        self.websocket = None
        self.current_id = 0
        self.ws_url = None
        self.ws_response : List[asyncio.Queue] = []
        self.connected_tabs : List[BrowserTabHook] = []

        asyncio.create_task(self.on_new_tab())
        asyncio.create_task(self.on_tab_update())
        asyncio.create_task(self.on_tab_attach())
        asyncio.create_task(self.on_tab_detach())
        asyncio.create_task(self.health_check())
        asyncio.create_task(self.css_health_check())
        asyncio.create_task(self.sanity_check_tabs())

    def get_id(self) -> int:
        self.current_id += 1
        return self.current_id
    
    async def open_websocket(self):
        self.client = aiohttp.ClientSession()
        self.websocket = await self.client.ws_connect(self.ws_url)

    async def close_websocket(self):
        self.connected_tabs.clear()
        await self.websocket.close()
        await self.client.close() 
        self.websocket = None 
        self.client = None

    def is_connected(self) -> bool:
        return self.websocket != None and not self.websocket.closed

    async def send_command(self, method : str, params : dict, sessionId : str|None, await_response : bool = True):
        if self.is_connected():
            id = self.get_id()
            data = {
                "id": id,
                "method": method,
                "params": params
            }

            if sessionId != None:
                data["sessionId"] = sessionId

            if await_response:
                queue = asyncio.Queue(maxsize=MAX_QUEUE_SIZE)
                self.ws_response.append(queue)

            await self.websocket.send_json(data)

            start_time = time.time()

            while await_response:
                result = await queue.get()

                if (start_time + 5) < time.time():
                    Result(False, f"Request for {method} took more than 5s. Assuming it failed ({len(self.connected_tabs)})")
                    self.ws_response.remove(queue)
                    del queue
                    return None
                
                if "id" in result and result["id"] == id:
                    self.ws_response.remove(queue)
                    del queue
                    return result          
                
            return None
        raise RuntimeError("Websocket not opened")   
    
    async def _tab_exists(self, tab_id : str):
        result = await self.send_command("Target.getTargets", {}, None)
        return tab_id in [x["targetId"] for x in result["result"]["targetInfos"] if x["type"] == "page"]

    async def on_new_tab(self):
        queue = asyncio.Queue(maxsize=MAX_QUEUE_SIZE)
        self.ws_response.append(queue) 

        while True:
            message = await queue.get()
            
            if "method" in message and message["method"] == "Target.targetCreated":
                if message["params"]["targetInfo"]["type"] != "page":
                    continue

                if not await self._tab_exists(message["params"]["targetInfo"]["targetId"]):
                    continue

                await self.send_command("Target.attachToTarget", {"targetId": message["params"]["targetInfo"]["targetId"], "flatten": True}, None, False)

    async def on_tab_update(self):
        queue = asyncio.Queue(maxsize=MAX_QUEUE_SIZE)
        self.ws_response.append(queue) 

        while True:
            message = await queue.get()     

            if "method" in message and message["method"] == "Target.targetInfoChanged":
                target_info = message["params"]["targetInfo"]

                if not await self._tab_exists(message["params"]["targetInfo"]["targetId"]):
                    continue

                for connected_tab in self.connected_tabs:
                    if target_info["targetId"] == connected_tab.id:
                        reinject = False

                        if (target_info["title"] != connected_tab.title):
                            connected_tab.title = target_info["title"]
                            reinject = True

                        if (target_info["url"] != connected_tab.url):
                            connected_tab.url = target_info["url"]
                            reinject = True

                        if reinject:
                            asyncio.create_task(connected_tab.force_reinject())

                        found = True
                        break
    
    async def on_tab_attach(self):
        queue = asyncio.Queue(maxsize=MAX_QUEUE_SIZE)
        self.ws_response.append(queue) 

        while True:
            message = await queue.get()    

            if "method" in message and message["method"] == "Target.attachedToTarget":
                self.connected_tabs.append(BrowserTabHook(self, message["params"]["sessionId"], message["params"]["targetInfo"]))
    
    async def on_tab_detach(self):
        queue = asyncio.Queue(maxsize=MAX_QUEUE_SIZE)
        self.ws_response.append(queue) 

        while True:
            message = await queue.get()

            if "method" in message and message["method"] == "Target.detachedFromTarget":    
                targetId = message["params"]["targetId"]

                tab = None

                for x in self.connected_tabs:
                    if x.id == targetId:
                        tab = x
                        break
                
                if tab != None:
                    Log(f"Disconnected from tab: {tab.title}")
                    self.connected_tabs.remove(tab)

    async def sanity_check_tabs(self):
        while True:
            try:
                result = await self.send_command("Target.getTargets", {}, None, True)
                target_infos = result["result"]["targetInfos"]
                target_ids = [x["targetId"] for x in target_infos if x["type"] == "page"]
                for x in self.connected_tabs: # Remove tabs that are no longer connected
                    if x.id not in target_ids:
                        Log(f"Disconnected from tab: {x.title}")
                        self.connected_tabs.remove(x)
                
                connected_ids = [x.id for x in self.connected_tabs]
                for x in target_infos:
                    if x["targetId"] not in connected_ids: # Attach tabs that are not connected
                        await self.send_command("Target.attachToTarget", {"targetId": x["targetId"], "flatten": True}, None, False)
                    else:
                        for connected_tab in self.connected_tabs: # Update info on tabs that are connected
                            if connected_tab.id == x["targetId"]:
                                reinject = False
                                if (x["title"] != connected_tab.title):
                                    connected_tab.title = x["title"]
                                    reinject = True

                                if (x["url"] != connected_tab.url):
                                    connected_tab.url = x["url"]
                                    reinject = True

                                if reinject:
                                    asyncio.create_task(connected_tab.force_reinject())

                                break
            except:
                pass
            
            await asyncio.sleep(5)

    async def css_health_check(self):
        while True:
            for tab in self.connected_tabs:
                try:
                    await tab.health_check()
                except Exception as e:
                    Result(False, f"[Health Check on {tab.title}] {str(e)}")

            await asyncio.sleep(3)  

    async def health_check(self):
        while True:
            await asyncio.sleep(3)
            try:
                async with aiohttp.ClientSession(trust_env=PLATFORM_WIN) as web:
                    res = await web.get(f"http://127.0.0.1:8080/json/version", timeout=3)

                if (res.status != 200):
                    raise Exception(f"/json/version returned {res.status}")

                data = await res.json()
                self.ws_url = data["webSocketDebuggerUrl"]

                await self.open_websocket()
                Log("Connected to Steam Browser")
                await self.send_command("Target.setDiscoverTargets", {"discover": True}, None, False)

                async for message in self.websocket:
                    data = message.json()
                    for x in self.ws_response:
                        if not x.full():
                            x.put_nowait(data)

            except Exception as e:
                Result(False, f"[Health Check] {str(e)}")

            try:
                await self.close_websocket()
            except:
                pass

HOOK : BrowserHook = None

async def initialize():
    global HOOK
    HOOK = BrowserHook()

def get_tabs(tab_name : str) -> List[BrowserTabHook]:
    tabs = []

    for tab in HOOK.connected_tabs:
        if tab.compare(tab_name):
            tabs.append(tab)

    #if tabs == []:
    #    Log(f"[Warn] get_tabs({tab_name}) returned []. All tabs: {str([x.title for x in HOOK.connected_tabs])}")
    
    return tabs

async def inject(tab_name : str, css : str) -> Result:
    id = str(uuid.uuid4())
    for tab in get_tabs(tab_name):
        await tab.inject_css(css, id)
    
    return Result(True, id)

async def remove(tab_name : str, css_id : str) -> Result:
    for tab in get_tabs(tab_name):
        await tab.remove_css(css_id)
    
    return Result(True)

async def commit_all(remove_all_first : bool = False):
    await asyncio.gather(*[x.commit_css_transaction(remove_all_first=remove_all_first) for x in HOOK.connected_tabs])

async def remove_all():
    await asyncio.gather(*[x.remove_all_css() for x in HOOK.connected_tabs])