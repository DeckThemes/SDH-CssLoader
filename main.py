import os, asyncio, sys, time

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

sys.path.append(os.path.dirname(__file__))

from css_utils import Log, create_steam_symlink, Result, get_theme_path, store_read as util_store_read, store_write as util_store_write, store_or_file_config
from css_inject import ALL_INJECTS
from css_theme import CSS_LOADER_VER
from css_remoteinstall import install

from css_server import start_server
from css_browserhook import initialize
from css_loader import Loader

ALWAYS_RUN_SERVER = False
IS_STANDALONE = False

try:
    if not store_or_file_config("no_redirect_logs"):
        import decky_plugin
except:
    pass

Initialized = False

class FileChangeHandler(FileSystemEventHandler):
    def __init__(self, loader : Loader, loop):
        self.loader = loader
        self.loop = loop
        self.last = 0
        self.delay = 1

    def on_modified(self, event):
        #Log(f"FS Event: {event}")

        if (not (event.src_path.endswith(".css") or event.src_path.endswith("theme.json"))) or event.is_directory:
            #Log("FS Event is not on a CSS file. Ignoring!")
            return

        if ((self.last + self.delay) < time.time() and not self.loader.busy):
            self.last = time.time()
            Log("Reloading themes due to FS event")
            self.loop.create_task(self.loader.reset())
        

class Plugin:
    async def is_standalone(self) -> bool:
        return IS_STANDALONE
    
    async def get_watch_state(self) -> bool:
        return self.observer != None
    
    async def get_server_state(self) -> bool:
        return self.server_loaded

    async def enable_server(self) -> dict:
        if self.server_loaded:
            return Result(False, "Nothing to do!").to_dict()
        
        start_server(self)
        self.server_loaded = True
        return Result(True).to_dict()
    
    async def toggle_watch_state(self, enable : bool = True, only_this_session : bool = False) -> dict:
        if enable and self.observer == None:
            Log("Observing themes folder for file changes")
            self.observer = Observer()
            self.handler = FileChangeHandler(self.loader, asyncio.get_running_loop())
            self.observer.schedule(self.handler, get_theme_path(), recursive=True)
            self.observer.start()

            if not only_this_session:
                util_store_write("watch", "1")

            return Result(True).to_dict()
        elif self.observer != None and not enable:
            Log("Stopping observer")
            self.observer.stop()
            self.observer = None

            if not only_this_session:
                util_store_write("watch", "0")

            return Result(True).to_dict()
        
        return Result(False, "Nothing to do!").to_dict()

    async def dummy_function(self) -> bool:
        return True

    async def fetch_theme_path(self) -> str:
        return get_theme_path()

    async def get_themes(self) -> list:
        return [x.to_dict() for x in self.loader.themes]
    
    async def set_theme_state(self, name : str, state : bool, set_deps : bool = True, set_deps_value : bool = True) -> dict:
        return (await self.loader.set_theme_state(name, state, set_deps, set_deps_value)).to_dict()

    async def download_theme_from_url(self, id : str, url : str) -> dict:
        local_themes = [x.name for x in self.loader.themes]
        return (await install(id, url, local_themes)).to_dict()

    async def get_backend_version(self) -> int:
        return CSS_LOADER_VER

    async def set_patch_of_theme(self, themeName : str, patchName : str, value : str) -> dict:
        return (await self.loader.set_patch_of_theme(themeName, patchName, value)).to_dict()
    
    async def set_component_of_theme_patch(self, themeName : str, patchName : str, componentName : str, value : str) -> dict:
        return (await self.loader.set_component_of_theme_patch(themeName, patchName, componentName, value)).to_dict()
    
    async def reset(self) -> dict:
        return (await self.loader.reset())

    async def delete_theme(self, themeName : str) -> dict:
        return (await self.loader.delete_theme(themeName)).to_dict()
    
    async def generate_preset_theme(self, name : str) -> Result:
        return (await self.loader.generate_preset_theme(name)).to_dict()

    async def generate_preset_theme_from_theme_names(self, name : str, themeNames : list) -> Result:
        return (await self.loader.generate_preset_theme_from_theme_names(name, themeNames)).to_dict()

    async def store_read(self, key : str) -> str:
        return util_store_read(key)
    
    async def store_write(self, key : str, val : str) -> dict:
        util_store_write(key, val)
        return Result(True).to_dict()

    async def exit(self):
        try:
            import css_win_tray
            css_win_tray.stop_icon()
        except:
            pass

        sys.exit(0)
    
    async def get_last_load_errors(self):
        return {
            "fails": self.loader.last_load_errors
        }

    async def _main(self):
        global Initialized
        if Initialized:
            return
        
        Initialized = True
        self.observer = None
        self.server_loaded = False

        Log("Initializing css loader...")
        Log(f"Max supported manifest version: {CSS_LOADER_VER}")
        
        create_steam_symlink()

        self.loader = Loader()
        await self.loader.load(False)

        if (store_or_file_config("watch")):
            await self.toggle_watch_state(self)
        else:
            Log("Not observing themes folder for file changes")

        Log(f"Initialized css loader. Found {len(self.loader.themes)} themes. Total {len(ALL_INJECTS)} injects, {len([x for x in ALL_INJECTS if x.enabled])} injected")
        
        if (ALWAYS_RUN_SERVER or store_or_file_config("server")):
            await self.enable_server(self)

        await initialize()

if __name__ == '__main__':
    ALWAYS_RUN_SERVER = True
    IS_STANDALONE = True
    import logging

    logging.basicConfig(
        format='[%(asctime)s][%(levelname)s]: %(message)s',
        force=True,
        filename=os.path.join(get_theme_path(), "standalone.log"),
        filemode="w"
    )

    Logger = logging.getLogger("CSS_LOADER")
    Logger.addHandler(logging.StreamHandler())
    Logger.setLevel(logging.INFO)

    asyncio.set_event_loop(asyncio.new_event_loop())

    class A:
        async def run(self):
            count = 0
            while count < 5:
                try:
                    task = asyncio.create_task(Plugin._main(Plugin))
                    await asyncio.shield(task)
                except asyncio.CancelledError as e:
                    print(str(e))
                except Exception as e:
                    print(str(e))
                
                count += 1

    asyncio.get_event_loop().run_until_complete(A().run())

    import css_win_tray
    
    css_win_tray.start_icon(Plugin, asyncio.get_event_loop())

    try:
        asyncio.get_event_loop().run_forever()
    except KeyboardInterrupt:
        pass

    css_win_tray.stop_icon()