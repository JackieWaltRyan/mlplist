from json import loads, dump
from os import walk, makedirs
from os.path import exists
from shutil import rmtree, copy
from sys import exit

from bs4 import BeautifulSoup

from parsers import FUNCTIONS
from utils import DATA, load_image

FOLDERS = [["000_and_mlpextra_common"],
           ["000_and_mlpextra_pvr_common", "000_and_mlpextra_astc_pvr_common"],
           ["000_and_mlpextra_veryhigh", "000_and_mlpextra_astc_veryhigh"],
           ["000_and_mlpextra2_pvr_common", "000_and_mlpextra2_astc_pvr_common"],
           ["000_and_mlpextra2_veryhigh", "000_and_mlpextra2_astc_veryhigh"],
           ["000_and_mlpextragui_veryhigh/gui", "000_and_mlpextragui_astc_veryhigh/gui"],
           ["000_and_startup_common"],
           ["001_and_mlpdata_veryhigh", "001_and_mlpdata_astc_veryhigh"]]

LANGUAGES = ["arabic.json", "chinese.json", "english.json", "french.json", "german.json", "italian.json",
             "japanese.json", "korean.json", "portuguese.json", "russian.json", "spanish.json", "thai.json",
             "turkish.json"]


def copy_languages_files():
    try:
        trigger, languages = True, {}

        for file in LANGUAGES:
            if exists(path=f"000_and_startup_common/{file}"):
                print(f"4: Копирование файла 000_and_startup_common/{file}.\n")

                if not exists(path="MLPlist/languages"):
                    print(f"    Создание папки MLPlist/languages.\n")

                    try:
                        makedirs(name="MLPlist/languages")
                    except Exception:
                        print(f"[ERROR] Во время создания папки MLPlist/languages возникла ошибка. "
                              f"Возможно нет прав на создания папок.\n")

                        trigger = False

                copy(src=f"000_and_startup_common/{file}",
                     dst=f"MLPlist/languages/{file}")

                with open(file=f"000_and_startup_common/{file}",
                          mode="r",
                          encoding="UTF-8") as language_file:
                    data = loads(s=language_file.read())["DEV_ID"]

                    languages.update({data: file})
            else:
                print(f"[ERROR] Отсутствует папка 000_and_startup_common или в ней нет файла {file}. "
                      f"Разархивируйте архив 000_and_startup_common.ark используя программу ARKdumper. "
                      f"В настройках программы ARKdumper обязательно установите Convert = 1.\n")

                trigger = False

        languages = dict(sorted(languages.items(),
                                key=lambda x: x[0].lower()))

        print("5: Создание файла MLPlist/languages.json.\n")

        with open(file="MLPlist/languages.json",
                  mode="w",
                  encoding="UTF-8") as languages_json:
            dump(obj=languages,
                 fp=languages_json,
                 indent=4,
                 ensure_ascii=False)

        return trigger
    except Exception:
        print(f"[ERROR] Во время обработки файлов локализаций в папке 000_and_startup_common возникла ошибка. "
              f"Возможно данные в файлах повреждены или нет прав на чтение файлов.\n")

        return False


def parse_mapzones():
    try:
        mapzones_list = {}

        if exists(path="000_and_startup_common/mapzones.xml"):
            print("6: Обработка файла 000_and_startup_common/mapzones.xml.\n")

            with open(file="000_and_startup_common/mapzones.xml",
                      mode="r",
                      encoding="UTF-8") as mapzones_xml:
                soup = BeautifulSoup(markup=mapzones_xml.read(),
                                     features="xml").find_all(name="World",
                                                              limit=1)[0]

                for item in soup.find_all(name="MapZone"):
                    name = item.find_all(name="UI",
                                         limit=1)[0].find_all(name="flash",
                                                              limit=1)[0]["zoneNameString"]

                    if name not in mapzones_list:
                        mapzones_list.update({name: [item["ID"]]})
                    else:
                        mapzones_list[name].append(item["ID"])

                print("7: Создание файла MLPlist/mapzones.json.\n")

                with open(file="MLPlist/mapzones.json",
                          mode="w",
                          encoding="UTF-8") as mapzones_json:
                    dump(obj=mapzones_list,
                         fp=mapzones_json,
                         indent=4,
                         ensure_ascii=False)

                return True
        else:
            print("[ERROR] Отсутствует папка 000_and_startup_common или в ней нет файла mapzones.xml. "
                  "Разархивируйте архив 000_and_startup_common.ark используя программу ARKdumper. "
                  "В настройках программы ARKdumper обязательно установите Convert = 1.\n")

            return False
    except Exception:
        print("[ERROR] Во время обработки файла 000_and_startup_common/mapzones.xml возникла ошибка. "
              "Возможно данные в файле повреждены или нет прав на чтение файлов.\n")

        return False


def find_image_files():
    try:
        image_list, trigger = {}, True

        for folder in FOLDERS:
            if exists(path=folder[0]):
                print(f"2: Обработка папки {folder[0]}.\n")

                try:
                    for (root, dirs, files) in walk(top=folder[0]):
                        for file in files:
                            if file.endswith(".png"):
                                folder = root.replace("\\",
                                                      "/")

                                image_list.update({file.replace(".png",
                                                                ""): f"{folder}/{file}"})
                except Exception:
                    print(f"[ERROR] Во время обработки файлов в папке {folder[0]} возникла ошибка. "
                          f"Возможно файлы в папке повреждены или нет прав на чтение файлов.\n")

                    trigger = False
            elif (len(folder) == 2) and exists(path=folder[1]):
                print(f"2: Обработка папки {folder[1]}.\n")

                try:
                    for (root, dirs, files) in walk(top=folder[1]):
                        for file in files:
                            if file.endswith(".png"):
                                folder = root.replace("\\",
                                                      "/")

                                image_list.update({file.replace(".png",
                                                                ""): f"{folder}/{file}"})
                except Exception:
                    print(f"[ERROR] Во время обработки файлов в папке {folder[1]} возникла ошибка. "
                          f"Возможно файлы в папке повреждены или нет прав на чтение файлов.\n")

                    trigger = False
            else:
                if len(folder) == 1:
                    print(f"[ERROR] Отсутствует папка {folder[0]} или в ней нет файлов. "
                          f"Разархивируйте архив {folder[0]}.ark используя программу ARKdumper. "
                          f"В настройках программы ARKdumper обязательно установите Convert = 1 и Split = 1.\n")
                else:
                    print(f"[ERROR] Отсутствуют папки {folder[0]} и {folder[1]} или в них нет файлов. "
                          f"Для работы программы нужна хотябы одна их них. "
                          f"Разархивируйте архив {folder[0]}.ark или {folder[1]}.ark используя программу ARKdumper. "
                          f"В настройках программы ARKdumper обязательно установите Convert = 1 и Split = 1.\n")

                trigger = False

        return image_list if trigger else None
    except Exception:
        folders = ", ".join([(", ".join(x) if (len(x) == 2) else x[0]) for x in FOLDERS])

        print(f"[ERROR] Во время обработки PNG файлов в папках {folders} возникла ошибка. "
              f"Возможно файлы в папках повреждены или нет прав на чтение файлов.\n")

        return None


def parse_shopdata():
    try:
        shopdata_list = {}

        if exists(path="000_and_startup_common/shopdata.xml"):
            print("3: Обработка файла 000_and_startup_common/shopdata.xml.\n")

            with open(file="000_and_startup_common/shopdata.xml",
                      mode="r",
                      encoding="UTF-8") as shopdata_xml:
                soup = BeautifulSoup(markup=shopdata_xml.read(),
                                     features="xml").find_all(name="ShopItemData",
                                                              limit=1)[0]

                for sic in soup.find_all(name="ShopItemCategory"):
                    for item in sic.find_all(name="ShopItem"):
                        mapzone = None

                        try:
                            if item["MapZone"] != "-1":
                                mapzone = item["MapZone"].replace(" ",
                                                                  "").split(",")
                        except Exception:
                            pass

                        shopdata_list.update({item["ID"]: mapzone})

                return shopdata_list
        else:
            print("[ERROR] Отсутствует папка 000_and_startup_common или в ней нет файла shopdata.xml. "
                  "Разархивируйте архив 000_and_startup_common.ark используя программу ARKdumper. "
                  "В настройках программы ARKdumper обязательно установите Convert = 1.\n")

            return None
    except Exception:
        print("[ERROR] Во время обработки файла 000_and_startup_common/shopdata.xml возникла ошибка. "
              "Возможно данные в файле повреждены или нет прав на чтение файлов.\n")

        return None


def create_files_html(data):
    try:
        trigger, categoryes = True, {}

        for cat in data:
            print(f"9: Создание файла MLPlist/categoryes/{cat.lower()}.json.\n")

            if not exists(path="MLPlist/categoryes"):
                print(f"    Создание папки MLPlist/categoryes.\n")

                try:
                    makedirs(name="MLPlist/categoryes")
                except Exception:
                    print(f"[ERROR] Во время создания папки MLPlist/categoryes возникла ошибка. "
                          f"Возможно нет прав на создания папок.\n")

                    trigger = False

            try:
                with open(file=f"MLPlist/categoryes/{cat.lower()}.json",
                          mode="w",
                          encoding="UTF-8") as cat_json:
                    dump(obj=data[cat],
                         fp=cat_json,
                         indent=4,
                         ensure_ascii=False)

                categoryes.update({DATA["descriptions"][cat]: {"image": data[cat][1]["Изображение"],
                                                               "page": cat.lower()}})
            except Exception:
                print(f"[WARNING] Во время создания файла MLPlist/{cat.lower()}.json возникла ошибка. "
                      f"Возможно нет прав на создания файлов. "
                      f"Файл пропущен.\n")

                trigger = False

            if not exists(path="MLPlist/resources"):
                print("    Создание папки MLPlist/resources.\n")

                try:
                    makedirs(name="MLPlist/resources")
                except Exception:
                    print("[ERROR] Во время создания папки MLPlist/resources возникла ошибка. "
                          "Возможно нет прав на создания папок.\n")

                    trigger = False

            print(f"    Сохранение ресурсов...")

            ii = 1

            load_image(image="mlp_splash",
                       category=cat)

            try:
                for file in DATA["hosting"][cat]:
                    print(f"\r        Обработано {ii} из {len(DATA['hosting'][cat])}.",
                          end="")

                    with open(file=f"MLPlist/resources/{file}",
                              mode="wb") as output_res_file:
                        output_res_file.write(DATA["hosting"][cat][file])

                    ii += 1

                print("")
            except Exception:
                print("")

                print(f"[WARNING] Во время сохранениея ресурсов файла MLPlist/resources/{cat}.json возникла ошибка. "
                      f"Возможно нет прав на создания файлов. "
                      f"Изображения в этом файле могут отсутствовать!\n")

                trigger = False

            print("")

        categoryes = dict(sorted(categoryes.items(),
                                 key=lambda x: x[0].lower()))

        print(f"10: Создание файла MLPlist/categoryes.json.\n")

        with open(file="MLPlist/categoryes.json",
                  mode="w",
                  encoding="UTF-8") as categoryes_json:
            dump(obj=categoryes,
                 fp=categoryes_json,
                 indent=4,
                 ensure_ascii=False)

        return trigger
    except Exception:
        print(f"[ERROR] Во время создания JSON файлов возникла ошибка. "
              f"Возможно нет прав на создания файлов.\n")

        return False


def parse_gameobjectdata():
    try:
        trigger, all_data = True, {}

        if not exists(path="000_and_mlpextra_common/gameobjectdata.xml"):
            print("[ERROR] Отсутствует папка 000_and_mlpextra_common или в ней нет файла gameobjectdata.xml. "
                  "Разархивируйте архив 000_and_mlpextra_common.ark используя программу ARKdumper.\n")

            trigger = False

        if trigger and DATA["images"] and DATA["shopdata"]:
            print("8: Обработка файла 000_and_mlpextra_common/gameobjectdata.xml.\n")

            with open(file="000_and_mlpextra_common/gameobjectdata.xml",
                      mode="r",
                      encoding="UTF-8") as gameobjectdata_xml:
                soup = BeautifulSoup(markup=gameobjectdata_xml.read(),
                                     features="xml").find_all(name="GameObjects",
                                                              limit=1)[0]

                for cat in FUNCTIONS:
                    print(f"    Поиск всех {cat}...")

                    try:
                        data, i, ii, items = {}, 1, 1, soup.find_all(name="Category",
                                                                     attrs={"ID": cat},
                                                                     limit=1)[0]

                        for item in items:
                            print(f"\r        Обработано {ii} из {len(items)}.",
                                  end="")

                            if len(item) > 1:
                                res = FUNCTIONS[cat](item=item,
                                                     category=cat)

                                if res:
                                    res.update({"id": item["ID"]})

                                    data.update({i: res})

                                    i += 1

                            ii += 1

                        all_data.update({cat: data})

                        print("")
                    except Exception:
                        print("")

                        print(f"[WARNING] Во время обработки категории {cat} возникла ошибка. "
                              f"Возможно данные в файле повреждены или нет прав на чтение файлов. "
                              f"Категория пропущена.\n")

                        trigger = False

                    print("")

                if len(all_data) > 0:
                    trigger = (create_files_html(data=all_data) if trigger else False)

                return trigger
        else:
            return False
    except Exception:
        print("[ERROR] Во время обработки файла 000_and_mlpextra_common/gameobjectdata.xml возникла ошибка. "
              "Возможно данные в файле повреждены или нет прав на чтение файлов.\n")

        return False


if __name__ == "__main__":
    try:
        TRIGGER = True

        if exists(path="MLPlist"):
            print(f"1: Удаление старой папки MLPlist.\n")

            try:
                rmtree(path="MLPlist")
            except Exception:
                print(f"[ERROR] Во время удаления папки MLPlist возникла ошибка. "
                      f"Возможно нет прав на удаления папок.\n")

                TRIGGER = False

        if not exists(path="MLPlist"):
            print(f"1: Создание папки MLPlist.\n")

            try:
                makedirs(name="MLPlist")
            except Exception:
                print(f"[ERROR] Во время создания папки MLPlist возникла ошибка. "
                      f"Возможно нет прав на создания папок.\n")

                TRIGGER = False

        DATA.update({"images": find_image_files()})
        DATA.update({"shopdata": parse_shopdata()})

        if TRIGGER and copy_languages_files() and parse_mapzones() and parse_gameobjectdata():
            exit()
        else:
            raise Exception
    except Exception:
        print("[INFO] Работа программы завершена, но во время работы возникли ошибки!\n")

        input()
        exit()
