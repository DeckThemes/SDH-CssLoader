import asyncio, json, tempfile, os
from css_utils import Result, Log

class RemoteInstall:
    def __init__(self, plugin):
        self.themeDb = "https://github.com/suchmememanyskill/CssLoader-ThemeDb/releases/download/1.1.0/themes.json"
        self.plugin = plugin
        self.themes = []

    async def run(self, command : str) -> str:
        proc = await asyncio.create_subprocess_shell(command,        
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE)

        stdout, stderr = await proc.communicate()
        if (proc.returncode != 0):
            raise Exception(f"Process exited with error code {proc.returncode}")

        return stdout.decode()

    async def load(self, force : bool = False) -> Result:
        try:
            if force or (self.themes == []):
                response = await self.run(f"curl {self.themeDb} -L")
                self.themes = json.loads(response)
                Log(f"Got {len(self.themes)} from the themedb")
        except Exception as e:
            return Result(False, str(e))
        
        return Result(True)

    async def get_theme_db_entry_by_uuid(self, uuid : str) -> dict:
        result = await self.load()
        if not result.success:
            raise Exception(result.message)

        for x in self.themes:
            if x["id"] == uuid:
                return x
            
        raise Exception(f"No theme with id {uuid} found")

    async def get_theme_db_entry_by_name(self, name : str) -> dict:
        result = await self.load()
        if not result.success:
            raise Exception(result.message)

        for x in self.themes:
            if x["name"] == name:
                return x
            
        raise Exception(f"No theme with name {name} found")

    async def install(self, uuid : str) -> Result:
        try:
            theme = await self.get_theme_db_entry_by_uuid(uuid)
            tempDir = tempfile.TemporaryDirectory()

            Log(f"Downloading {theme['download_url']} to {tempDir.name}...")
            themeZipPath = os.path.join(tempDir.name, 'theme.zip')
            await self.run(f"curl \"{theme['download_url']}\" -L -o \"{themeZipPath}\"")

            Log(f"Unzipping {themeZipPath}")
            await self.run(f"unzip -o \"{themeZipPath}\" -d /home/deck/homebrew/themes")

            tempDir.cleanup()
        except Exception as e:
            return Result(False, str(e))

        return Result(True)