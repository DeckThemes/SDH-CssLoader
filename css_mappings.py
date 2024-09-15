import os, asyncio, aiohttp, json, time
from css_loader import get_loader_instance
from css_utils import Log, get_theme_path, get_steam_version
from css_settings import setting_beta_mappings
from css_inject import initialize_class_mappings
from css_browserhook import ON_WEBSOCKET_CONNECT

STARTED_FETCHING_TRANSLATIONS = False
SUCCESSFUL_FETCH_THIS_RUN = False

def __get_target_steam_version(data : dict) -> str|None:
    local_steam_version = get_steam_version()
    is_beta = setting_beta_mappings()
    target_branch = ("beta" if is_beta else "stable")

    if local_steam_version and local_steam_version in data['versions'] and data['versions'][local_steam_version] == target_branch:
        target_steam_version = local_steam_version
    else:
        target_steam_version = None
        prev = "999999999999"
        for i, (k, v) in list(enumerate(data['versions'].items()))[::-1]:
            if v == local_steam_version:
                if int(prev) > int(target_steam_version) and int(k) < int(target_steam_version):
                    target_steam_version = k
                    break

                prev = k
        
        if target_steam_version not in data['versions']:
            Log("Cannot find suitable version for translation")
            return None
    
    return target_steam_version

def generate_translations_from_local_file() -> dict[str, str]:
    translations = {}
    timer = time.time()

    path = os.path.join(get_theme_path(), "css_translations.json")

    if not os.path.exists(path):
        Log("Translations file does not exist.")
        return translations
    
    try:
        with open(path, 'r', encoding="utf-8") as fp:
            data = json.load(fp)
    except Exception as e:
        Log(f"Error while loading translations: {str(e)}.")
        return translations
    
    target_steam_version = __get_target_steam_version(data)
    if target_steam_version == None:
        return translations
    
    Log(f"Using steam version {target_steam_version} for translations")

    for _, (module_id, module_data) in enumerate(data['module_mappings'].items()):
        module_name = (str(module_id) if module_data['name'] is None else module_data['name'])
        for _, (class_name, class_mappings) in enumerate(module_data['classname_mappings'].items()):
            class_target = None
            if target_steam_version in class_mappings:
                class_target = class_mappings[target_steam_version]
            else:
                prev = "9999999999999"
                for _, (class_mapping_name, class_mapping_value) in list(enumerate(class_mappings.items()))[::-1]:
                    if int(prev) > int(target_steam_version) and int(class_mapping_name) < int(target_steam_version):
                        class_target = class_mapping_value
                        break

                    prev = class_mapping_name
                
                if class_target == None:
                    Log(f"No suitable version found for mapping {module_id}_{class_name}. Using last")
                    class_target = class_mappings[list(class_mappings)[-1]]
                
            for class_mapping_value in class_mappings.values():
                if class_mapping_value == class_target:
                    continue
                
                translations[class_mapping_value] = class_target

            translations[f"{module_name}_{class_name}"] = class_target
    
    return translations

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