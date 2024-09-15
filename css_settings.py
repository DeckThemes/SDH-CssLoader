import os
from css_utils import get_theme_path, store_write, store_read, is_steam_beta_active

def store_or_file_config(key : str) -> bool:
    if os.path.exists(os.path.join(get_theme_path(), key.upper())):
        return True
    
    read = store_read(key)
    return read == "True" or read == "1"

def setting_beta_mappings() -> bool:
    setting = store_read("beta_translations")

    return ((len(setting.strip()) <= 0 or setting == "-1" or setting == "auto") and is_steam_beta_active()) or (setting == "1" or setting == "true")

def setting_redirect_logs() -> bool:
    return not store_or_file_config("no_redirect_logs")

def setting_watch_files() -> bool:
    return store_or_file_config("watch")

def set_setting_watch_files(watch : bool):
    store_write("watch", "1" if watch else "0")

def setting_run_server() -> bool:
    return store_or_file_config("server")

def setting_install_dependencies() -> bool:
    return not store_or_file_config("no_deps_install")