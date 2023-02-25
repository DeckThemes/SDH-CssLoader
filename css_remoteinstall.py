import asyncio, json, tempfile, os, aiohttp, zipfile
from css_utils import Result, Log, get_theme_path
from css_theme import CSS_LOADER_VER

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

    for x in data["dependencies"]:
        if x["name"] in local_themes:
            continue
            
        await install(x["id"], base_url, local_themes)
    
    return Result(True)