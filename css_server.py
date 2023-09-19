import asyncio, aiohttp.web, json
from css_utils import Log, create_cef_flag

PLUGIN_CLASS = None

async def handle(request : aiohttp.web.BaseRequest):
    data = await request.json()
    request_result = {"res": None, "success": True}

    # This is very cool decky code
    try:
        request_result["res"] = await getattr(PLUGIN_CLASS, data["method"])(PLUGIN_CLASS, **data["args"])
    except Exception as e:
        request_result["res"] = str(e)
        request_result["success"] = False
    finally:
        return aiohttp.web.Response(text=json.dumps(request_result, ensure_ascii=False), content_type='application/json')

def start_server(plugin):
    global PLUGIN_CLASS

    PLUGIN_CLASS = plugin
    loop = asyncio.get_running_loop()
    
    try:
        create_cef_flag()
    except Exception as e:
        Log(f"Failed to create steam cef flag. {str(e)}")

    app = aiohttp.web.Application(loop=loop)
    app.router.add_route('POST', '/req', handle)
    loop.create_task(aiohttp.web._run_app(app, host="127.0.0.1", port=35821))
    Log("Started CSS_Loader server on port 35821")