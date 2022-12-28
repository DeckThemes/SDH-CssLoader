import asyncio, json, tempfile, os
from css_utils import Result, Log, get_user_home, get_theme_path
from css_theme import CSS_LOADER_VER
import aiohttp

async def run(command : str) -> str:
    proc = await asyncio.create_subprocess_shell(command,        
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE)
    stdout, stderr = await proc.communicate()

    if (proc.returncode != 0):
        raise Exception(f"Process exited with error code {proc.returncode}")

    return stdout.decode()

async def install(id : str, base_url : str, local_themes : list) -> Result:
    if not base_url.endswith("/"):
        base_url = base_url + "/"

    url = f"{base_url}themes/{id}"

    try:
        async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(verify_ssl=False)) as session:
            async with session.get(url) as resp:
                if resp.status != 200:
                    raise Exception(f"Invalid status code {resp.status}")

                data = await resp.json()
    except Exception as e:
        return Result(False, str(e))
    
    download_url = f"{base_url}blobs/{data['download']['id']}" 
    tempDir = tempfile.TemporaryDirectory()

    Log(f"Downloading {download_url} to {tempDir.name}...")
    themeZipPath = os.path.join(tempDir.name, 'theme.zip')
    try:
        await run(f"curl \"{download_url}\" -L -o \"{themeZipPath}\"")
    except Exception as e:
        return Result(False, str(e))

    Log(f"Unzipping {themeZipPath}")
    try:
        await run(f"unzip -o \"{themeZipPath}\" -d \"{get_user_home()}/homebrew/themes\"")
    except Exception as e:
        return Result(False, str(e))

    tempDir.cleanup()

    for x in data["dependencies"]:
        if x["name"] in local_themes:
            continue
            
        await install(x["id"], base_url, local_themes)
    
    return Result(True)

class RemoteInstallItem:
    def __init__(self, content : dict, repo_url : str):
        self.raw = content
        self.id = content["id"]
        self.download_url = content["download_url"]
        self.preview_image = content["preview_image"]
        self.name = content["name"]
        self.version = content["version"] if "version" in content else "v1.0"
        self.author = content["author"]
        self.last_changed = content["last_changed"]
        self.target = content["target"] if "target" in content else "Other"
        self.source = content["source"] if "source" in content else ""
        self.manifest_version = int(content["manifest_version"]) if "manifest_version" in content else 1
        self.description = content["description"] if "description" in content else ""
        self.repo_url = repo_url

        if (self.manifest_version > CSS_LOADER_VER):
            raise Exception("Manifest version of themedb entry is unsupported by this version of CSS_Loader")

    async def install(self) -> Result:
        try:
            tempDir = tempfile.TemporaryDirectory()

            Log(f"Downloading {self.download_url} to {tempDir.name}...")
            themeZipPath = os.path.join(tempDir.name, 'theme.zip')
            await run(f"curl \"{self.download_url}\" -L -o \"{themeZipPath}\"")

            Log(f"Unzipping {themeZipPath}")
            await run(f"unzip -o \"{themeZipPath}\" -d \"{get_user_home()}/homebrew/themes\"")

            tempDir.cleanup()
        except Exception as e:
            return Result(False, str(e))

        return Result(True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "download_url": self.download_url,
            "preview_image": self.preview_image,
            "name": self.name,
            "version": self.version,
            "author": self.author,
            "last_changed": self.last_changed,
            "target": self.target,
            "source": self.source,
            "manifest_version": self.manifest_version,
            "description": self.description,
            "repo": self.repo_url,
        }

class RemoteInstall:
    def __init__(self):
        self.baseThemeDb = "https://github.com/suchmememanyskill/CssLoader-ThemeDb/releases/download/1.1.0/themes.json"
        self.themes = []
        self.init = False

    async def load(self, force : bool = False) -> Result:
        if (self.init and not force):
            return Result(True)

        try:
            repos_txt_path = os.path.join(get_theme_path(), "repos.txt")
            repos = [self.baseThemeDb]

            if (os.path.exists(repos_txt_path)):
                with open(repos_txt_path, "r") as fp:
                    repos.extend([x.strip() for x in fp.readlines() if not (x.startswith("#") or x.startswith("//") or x.strip() == "")])
            
            self.themes = []
            for x in repos:
                Log(f"Loading themedb {x}")
                await self.add_repo(x)

            self.init = True
        except Exception as e:
            return Result(False, str(e))
        
        return Result(True)
    
    async def add_repo(self, url : str) -> Result:
        try:
            theme_names = [x.name for x in self.themes]
            response = await run(f"curl \"{url}\" -L")
            themes = json.loads(response)
            count = 0
            
            for x in themes:
                try:
                    theme = RemoteInstallItem(x, "Official" if url == self.baseThemeDb else url)
                    
                    if theme.name in theme_names:
                        raise Exception("Theme already registered in remote theme pool")

                    self.themes.append(theme)
                    count += 1
                except Exception as e:
                    Result(False, str(e))

            Log(f"Got {count} themes from themedb '{url}'")
        except Exception as e:
            return Result(False, str(e))
        
        return Result(True)

    async def get_theme_db_entry_by_uuid(self, uuid : str) -> RemoteInstallItem:
        result = await self.load()
        if not result.success:
            raise Exception(result.message)

        for x in self.themes:
            if x.id == uuid:
                return x
            
        raise Exception(f"No theme with id {uuid} found")

    async def get_theme_db_entry_by_name(self, name : str) -> RemoteInstallItem:
        result = await self.load()
        if not result.success:
            raise Exception(result.message)

        for x in self.themes:
            if x.name == name:
                return x
            
        raise Exception(f"No theme with name {name} found")