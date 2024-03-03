import asyncio, json, tempfile, os, aiohttp, zipfile, shutil
from css_utils import Result, Log, get_theme_path, store_or_file_config
from css_theme import CSS_LOADER_VER, Theme

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

    async with aiohttp.ClientSession(headers={"User-Agent": f"SDH-CSSLoader/{CSS_LOADER_VER}"}, connector=aiohttp.TCPConnector(verify_ssl=False)) as session:
        try:
            async with session.get(url) as resp:
                if resp.status != 200:
                    raise Exception(f"Invalid status code {resp.status}")

                data = await resp.json()
        except Exception as e:
            return Result(False, str(e))

        if (data["manifestVersion"] > CSS_LOADER_VER):
            raise Exception("Manifest version of themedb entry is unsupported by this version of CSS_Loader")

        download_url = f"{base_url}blobs/{data['download']['id']}" 
        tempDir = tempfile.TemporaryDirectory()

        Log(f"Downloading {download_url} to {tempDir.name}...")
        themeZipPath = os.path.join(tempDir.name, 'theme.zip')
        try:
            async with session.get(download_url) as resp:
                if resp.status != 200:
                    raise Exception(f"Got {resp.status} code from '{download_url}'")

                with open(themeZipPath, "wb") as out:
                    out.write(await resp.read())

        except Exception as e:
            return Result(False, str(e))

    Log(f"Unzipping {themeZipPath}")
    try:
        with zipfile.ZipFile(themeZipPath, 'r') as zip:
            zip.extractall(get_theme_path())
    except Exception as e:
        return Result(False, str(e))

    tempDir.cleanup()

    if not store_or_file_config("no_deps_install"):
        for x in data["dependencies"]:
            if x["name"] in local_themes:
                continue
            
            await install(x["id"], base_url, local_themes)
    
    return Result(True)

async def upload(theme : Theme, base_url : str, bearer_token : str) -> Result:
    if not base_url.endswith("/"):
        base_url = base_url + "/"

    url = f"{base_url}blobs"

    with tempfile.TemporaryDirectory() as tmp:
        themePath = os.path.join(tmp, "theme.zip")
        print(themePath[:-4])
        print(theme.themePath)
        shutil.make_archive(themePath[:-4], 'zip', theme.themePath)

        with open(themePath, "rb") as file:
            async with aiohttp.ClientSession(headers={"User-Agent": f"SDH-CSSLoader/{CSS_LOADER_VER}", "Authorization": f"Bearer {bearer_token}"}, connector=aiohttp.TCPConnector(verify_ssl=False)) as session:
                try:
                    mp = aiohttp.FormData()
                    mp.add_field("file", file)
                    async with session.post(url, data=mp) as resp:
                        if resp.status != 200:
                            raise Exception(f"Invalid status code {resp.status}")

                        data = await resp.json()
                        return Result(True, data)
                except Exception as e:
                    return Result(False, str(e))