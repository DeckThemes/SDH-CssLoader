import os, asyncio, aiohttp, json, time
from css_utils import Log, get_theme_path, get_steam_version
from css_settings import setting_beta_mappings
from css_browserhook import ON_WEBSOCKET_CONNECT

STARTED_FETCHING_TRANSLATIONS = False
SUCCESSFUL_FETCH_THIS_RUN = False
CLASS_MAPPINGS = {}

def __get_target_branch() -> str:
    is_beta = setting_beta_mappings()
    return "beta" if is_beta else "stable"

def __get_same_branch_versions(data : dict) -> list[str]:
    target_branch = __get_target_branch()
    return [x for x in data['versions'] if data['versions'][x] == target_branch][::-1]

def __get_target_steam_version(data : dict) -> str|None:
    local_steam_version = get_steam_version()

    if local_steam_version and local_steam_version in data['versions'] and data['versions'][local_steam_version] == __get_target_branch():
        target_steam_version = local_steam_version
    else:
        target_steam_version = None
        prev = "9999999999999"
        for version in __get_same_branch_versions(data):
            if local_steam_version == None:
                target_steam_version = version
                break

            if int(prev) > int(local_steam_version) and int(version) < int(local_steam_version):
                target_steam_version = version
                break

            prev = version
        
        if target_steam_version not in data['versions']:
            Log("Cannot find suitable version for translation.")
            return None
    
    return target_steam_version

def generate_webpack_id_name_list_from_local_file() -> dict[str, dict]:
    name_list = {}
    path = os.path.join(get_theme_path(), "css_translations.json")

    try:
        with open(path, 'r', encoding="utf-8") as fp:
            data = json.load(fp)
    except Exception as e:
        Log(f"Error while loading translations: {str(e)}.")
        return name_list 

    target_steam_version = __get_target_steam_version(data)
    same_branch_versions = __get_same_branch_versions(data)
    if target_steam_version == None:
        return name_list

    for _, (module_id, module_data) in enumerate(data['module_mappings'].items()):
        if target_steam_version in module_data['ids']:
            new_module_id = module_data['ids'][target_steam_version]
        else: 
            prev = "9999999999999"
            new_module_id = None
            for _, (steam_version, module_id_of_steam_version) in list(enumerate(module_data['ids'].items()))[::-1]:
                if target_steam_version not in same_branch_versions:
                    continue

                if int(prev) > int(target_steam_version) and int(steam_version) < int(target_steam_version):
                    new_module_id = module_id_of_steam_version
                    break

                prev = steam_version
                
        if new_module_id == None:
            # Assuming module doesn't exist in this steam version
            continue
            
        name_list[new_module_id] = {"name": str(module_id) if module_data['name'] is None else module_data['name'], "ignore": module_data['ignore_webpack_keys']}
    
    return name_list

def generate_translations_from_local_file() -> dict[str, str]:
    translations = {}
    timer = time.time()
    failed_match_version = 0

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
    same_branch_versions = __get_same_branch_versions(data)
    if target_steam_version == None:
        return translations
    
    Log(f"Using steam version {target_steam_version} for translations. Available versions for the {__get_target_branch()} branch: {same_branch_versions}")

    for _, (module_id, module_data) in enumerate(data['module_mappings'].items()):
        module_name = (str(module_id) if module_data['name'] is None else module_data['name'])
        for _, (class_name, class_mappings) in enumerate(module_data['classname_mappings'].items()):
            if target_steam_version in class_mappings:
                class_target = class_mappings[target_steam_version]
            else:
                prev = "9999999999999"
                class_target = None
                for _, (class_mapping_name, class_mapping_value) in list(enumerate(class_mappings.items()))[::-1]:
                    if target_steam_version not in same_branch_versions:
                        continue

                    if int(prev) > int(target_steam_version) and int(class_mapping_name) < int(target_steam_version):
                        class_target = class_mapping_value
                        break

                    prev = class_mapping_name
                
                if class_target == None:
                    #Log(f"No suitable version found for mapping {module_id}_{class_name}. Using last")
                    failed_match_version += 1
                    class_target = class_mappings[list(class_mappings)[-1]]
                
            for class_mapping_value in class_mappings.values():
                if class_mapping_value == class_target:
                    continue
                
                translations[class_mapping_value] = class_target

            translations[f"{module_name}_{class_name}"] = class_target
            translations[f"{module_id}_{class_name}"] = class_target
    
    Log(f"Loaded {len(translations)} css translations from local file in {time.time() - timer:.1f}s. Failed to match version on {failed_match_version} translations.")
    return translations

def load_global_translations():
    CLASS_MAPPINGS.clear()

    try:
        for _, (k, v) in enumerate(generate_translations_from_local_file().items()):
            CLASS_MAPPINGS[k] = v
    except Exception as e:
        Log(f"Error while loading global translations: {str(e)}")

async def __fetch_class_mappings(css_translations_path : str, loader):
    global SUCCESSFUL_FETCH_THIS_RUN

    if SUCCESSFUL_FETCH_THIS_RUN:
        return
    
    css_translations_url = "https://api.deckthemes.com/mappings.json"
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
                    load_global_translations()
                    asyncio.get_running_loop().create_task(loader.reset(silent=True))

    except Exception as ex:
        Log(f"Failed to fetch css translations from server [{type(ex).__name__}]: {str(ex)}")
        
async def __every(__seconds: float, func, *args, **kwargs):
    global SUCCESSFUL_FETCH_THIS_RUN

    await ON_WEBSOCKET_CONNECT.wait()

    while not SUCCESSFUL_FETCH_THIS_RUN:
        await func(*args, **kwargs)
        await asyncio.sleep(__seconds)

async def force_fetch_translations(loader):
    global SUCCESSFUL_FETCH_THIS_RUN
    
    SUCCESSFUL_FETCH_THIS_RUN = False
    css_translations_path = os.path.join(get_theme_path(), "css_translations.json")
    await __fetch_class_mappings(css_translations_path, loader)

def start_fetch_translations(loader):
    css_translations_path = os.path.join(get_theme_path(), "css_translations.json")
    asyncio.get_event_loop().create_task(__every(60, __fetch_class_mappings, css_translations_path, loader))