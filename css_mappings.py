import os, asyncio, aiohttp
from css_loader import get_loader_instance
from css_utils import Log, get_theme_path
from css_settings import setting_beta_mappings
from css_inject import initialize_class_mappings
from css_browserhook import ON_WEBSOCKET_CONNECT

STARTED_FETCHING_TRANSLATIONS = False
SUCCESSFUL_FETCH_THIS_RUN = False

async def __fetch_class_mappings(css_translations_path : str):
    global SUCCESSFUL_FETCH_THIS_RUN

    if SUCCESSFUL_FETCH_THIS_RUN:
        return
    
    if setting_beta_mappings():
        css_translations_url = "https://api.deckthemes.com/beta.json"
    else:
        css_translations_url = "https://api.deckthemes.com/stable.json"

    Log(f"Fetching CSS mappings from {css_translations_url}")

    try:
        async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=False, use_dns_cache=False), timeout=aiohttp.ClientTimeout(total=30)) as session:
            async with session.get(css_translations_url) as response:
                if response.status == 200:
                    text = await response.text()
                    
                    if len(text.strip()) <= 0:
                        raise Exception("Empty response")

                    with open(css_translations_path, "w", encoding="utf-8") as fp:
                        fp.write(text)

                    SUCCESSFUL_FETCH_THIS_RUN = True
                    Log(f"Fetched css translations from server")
                    initialize_class_mappings()
                    asyncio.get_running_loop().create_task(get_loader_instance().reset(silent=True))

    except Exception as ex:
        Log(f"Failed to fetch css translations from server [{type(ex).__name__}]: {str(ex)}")
        
async def __every(__seconds: float, func, *args, **kwargs):
    global SUCCESSFUL_FETCH_THIS_RUN

    await ON_WEBSOCKET_CONNECT.wait()

    while not SUCCESSFUL_FETCH_THIS_RUN:
        await func(*args, **kwargs)
        await asyncio.sleep(__seconds)

async def force_fetch_translations():
    global SUCCESSFUL_FETCH_THIS_RUN
    
    SUCCESSFUL_FETCH_THIS_RUN = False
    css_translations_path = os.path.join(get_theme_path(), "css_translations.json")
    await __fetch_class_mappings(css_translations_path)

def start_fetch_translations():
    css_translations_path = os.path.join(get_theme_path(), "css_translations.json")
    asyncio.get_event_loop().create_task(__every(60, __fetch_class_mappings, css_translations_path))