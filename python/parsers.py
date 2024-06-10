from utils import DATA, load_image

FUNCTIONS = {}


class Parser:
    def __init__(self, category, description=""):
        self.category = category
        self.description = description

        if "descriptions" not in DATA:
            DATA.update({"descriptions": {self.category: self.description}})
        else:
            DATA["descriptions"].update({self.category: self.description})

    def __call__(self, function):
        FUNCTIONS.update({self.category: function})

        def decorator(item, category=self.category):
            return function(item, category)

        return decorator


@Parser(category="PonyPet",
        description="Питомцы")
def ponypet(item, category):
    try:
        res_image, res_name, res_sity = "", "", []

        # gameobjectdata:
        try:
            image = load_image(image=item.find_all(name="PetUniqueIcon",
                                                   limit=1)[0]["Icon"],
                               category=category)

            if image:
                res_image = image
        except Exception:
            pass

        try:
            res_name = item.find_all(name="Name",
                                     limit=1)[0]["Unlocal"]
        except Exception:
            pass

        # shopdata:
        try:
            res_sity = DATA["shopdata"][item["ID"]]
        except Exception:
            pass

        if res_image and res_name and (item["ID"] in DATA["shopdata"]) and (res_name in DATA["english"]):
            return {"image": res_image,
                    "name": res_name,
                    "sity": res_sity}
    except Exception:
        return None


@Parser(category="ProfileAvatarFrame",
        description="Рамки аватаров")
def profileavatarframe(item, category):
    try:
        res_image, res_name, res_sity = "", "", []

        # gameobjectdata:
        try:
            image = load_image(image=item.find_all(name="Settings",
                                                   limit=1)[0]["PictureActive"],
                               category=category)

            if image:
                res_image = image
        except Exception:
            pass

        try:
            res_name = item.find_all(name="Shop",
                                     limit=1)[0]["Label"]
        except Exception:
            pass

        # shopdata:
        try:
            res_sity = DATA["shopdata"][item["ID"]]
        except Exception:
            pass

        if res_image and res_name and (item["ID"] in DATA["shopdata"]) and (res_name in DATA["english"]):
            return {"image": res_image,
                    "name": res_name,
                    "sity": res_sity}
    except Exception:
        return None


@Parser(category="ProfileAvatar",
        description="Аватары")
def profileavatar(item, category):
    try:
        res_image, res_name, res_sity = "", "", []

        # gameobjectdata:
        try:
            image = load_image(image=item.find_all(name="Settings",
                                                   limit=1)[0]["PictureActive"],
                               category=category)

            if image:
                res_image = image
        except Exception:
            pass

        try:
            res_name = item.find_all(name="Shop",
                                     limit=1)[0]["Label"]
        except Exception:
            pass

        # shopdata:
        try:
            res_sity = DATA["shopdata"][item["ID"]]
        except Exception:
            pass

        if res_image and res_name and (item["ID"] in DATA["shopdata"]) and (res_name in DATA["english"]):
            return {"image": res_image,
                    "name": res_name,
                    "sity": res_sity}
    except Exception:
        return None


@Parser(category="Theme",
        description="Темы")
def theme(item, category):
    try:
        res_image, res_name, res_sity = "", "", []

        # gameobjectdata:
        try:
            image = load_image(image=item.find_all(name="Appearance",
                                                   limit=1)[0]["Image"],
                               category=category)

            if image:
                res_image = image
        except Exception:
            pass

        try:
            res_name = item.find_all(name="Appearance",
                                     limit=1)[0]["Name"]
        except Exception:
            pass

        # shopdata:
        try:
            res_sity = DATA["shopdata"][item["ID"]]
        except Exception:
            pass

        if res_image and res_name and (item["ID"] in DATA["shopdata"]) and (res_name in DATA["english"]):
            return {"image": res_image,
                    "name": res_name,
                    "sity": res_sity}
    except Exception:
        return None


@Parser(category="Pony_House",
        description="Магазины")
def pony_house(item, category):
    try:
        res_image, res_name, res_type, res_sity = "", "", "", []

        # gameobjectdata:
        try:
            image = load_image(image=item.find_all(name="Shop",
                                                   limit=1)[0]["Icon"],
                               category=category)

            if image:
                res_image = image
        except Exception:
            pass

        try:
            res_name = item.find_all(name="Name",
                                     limit=1)[0]["Unlocal"]
        except Exception:
            pass

        try:
            res_type = item.find_all(name="ShopModule",
                                     limit=1)[0]["IsAShop"]
        except Exception:
            pass

        # shopdata:
        try:
            res_sity = DATA["shopdata"][item["ID"]]
        except Exception:
            pass

        if res_image and res_name and (res_type == "1") and (item["ID"] in DATA["shopdata"]) and (
                res_name in DATA["english"]):
            return {"image": res_image,
                    "name": res_name,
                    "sity": res_sity}
    except Exception:
        return None


@Parser(category="Pony",
        description="Персонажи")
def pony(item, category):
    try:
        res_image, res_name, res_sity = "", "", []

        # gameobjectdata:
        try:
            image = load_image(image=item.find_all(name="Shop",
                                                   limit=1)[0]["Icon"],
                               category=category)

            if image:
                res_image = image
        except Exception:
            pass

        try:
            res_name = item.find_all(name="Name",
                                     limit=1)[0]["Unlocal"]
        except Exception:
            pass

        # shopdata:
        try:
            res_sity = DATA["shopdata"][item["ID"]]
        except Exception:
            pass

        if res_image and res_name and (item["ID"] in DATA["shopdata"]) and (res_name in DATA["english"]):
            return {"image": res_image,
                    "name": res_name,
                    "sity": res_sity}
    except Exception:
        return None


@Parser(category="PonySet",
        description="Костюмы")
def ponyset(item, category):
    try:
        res_image, res_name, res_parts = "", "", []

        # gameobjectdata:
        try:
            image = load_image(image=item.find_all(name="PonySet",
                                                   limit=1)[0]["Icon"],
                               category=category)

            if image:
                res_image = image
        except Exception:
            pass

        try:
            res_name = item.find_all(name="PonySet",
                                     limit=1)[0]["Localization"]
        except Exception:
            pass

        try:
            parts_body = item.find_all(name="Parts",
                                       limit=1)[0]["Body"]

            if parts_body:
                res_parts.append(parts_body)
        except Exception:
            pass

        try:
            parts_mane = item.find_all(name="Parts",
                                       limit=1)[0]["Mane"]

            if parts_mane:
                res_parts.append(parts_mane)
        except Exception:
            pass

        try:
            parts_tail = item.find_all(name="Parts",
                                       limit=1)[0]["Tail"]

            if parts_tail:
                res_parts.append(parts_tail)
        except Exception:
            pass

        if res_image and res_name and (res_name in DATA["english"]):
            return {"image": res_image,
                    "name": res_name,
                    "parts": res_parts}
    except Exception:
        return None


@Parser(category="Path",
        description="Дорожки")
def path(item, category):
    try:
        res_image, res_name, res_sity, res_id = "", "", [], ""

        # gameobjectdata:
        try:
            image = load_image(image=item.find_all(name="Shop",
                                                   limit=1)[0]["Icon"],
                               category=category)
            if image:
                res_image = image
        except Exception:
            pass

        try:
            res_name = item.find_all(name="Name",
                                     limit=1)[0]["Unlocal"]
        except Exception:
            pass

        try:
            res_id = item.find_all(name="PermitID",
                                   limit=1)[0]["ID"]
        except Exception:
            pass

        # shopdata:
        try:
            res_sity = DATA["shopdata"][res_id]
        except Exception:
            pass

        if res_image and res_name and res_id and (res_id in DATA["shopdata"]) and (res_name in DATA["english"]):
            return {"image": res_image,
                    "name": res_name,
                    "sity": res_sity,
                    "id": res_id}
    except Exception:
        return None


@Parser(category="PlayerCardBackground",
        description="Фоны")
def playercardbackground(item, category):
    try:
        res_image, res_name, res_sity = "", "", []

        # gameobjectdata:
        try:
            image = load_image(image=item.find_all(name="Settings",
                                                   limit=1)[0]["PictureActive"],
                               category=category)

            if image:
                res_image = image
        except Exception:
            pass

        try:
            res_name = item.find_all(name="Shop",
                                     limit=1)[0]["Label"]
        except Exception:
            pass

        # shopdata:
        try:
            res_sity = DATA["shopdata"][item["ID"]]
        except Exception:
            pass

        if res_image and res_name and (item["ID"] in DATA["shopdata"]) and (res_name in DATA["english"]):
            return {"image": res_image,
                    "name": res_name,
                    "sity": res_sity}
    except Exception:
        return None


@Parser(category="PlayerCardBackgroundFrame",
        description="Рамки фонов")
def playercardbackgroundframe(item, category):
    try:
        res_image, res_name, res_sity = "", "", []

        # gameobjectdata:
        try:
            image = load_image(image=item.find_all(name="Settings",
                                                   limit=1)[0]["PictureActive"],
                               category=category)

            if image:
                res_image = image
        except Exception:
            pass

        try:
            res_name = item.find_all(name="Shop",
                                     limit=1)[0]["Label"]
        except Exception:
            pass

        # shopdata:
        try:
            res_sity = DATA["shopdata"][item["ID"]]
        except Exception:
            pass

        if res_image and res_name and (item["ID"] in DATA["shopdata"]) and (res_name in DATA["english"]):
            return {"image": res_image,
                    "name": res_name,
                    "sity": res_sity}
    except Exception:
        return None


@Parser(category="PlayerCardCutieMark",
        description="Метки")
def playercardcutiemark(item, category):
    try:
        res_image, res_name, res_sity = "", "", []

        # gameobjectdata:
        try:
            image = load_image(image=item.find_all(name="Settings",
                                                   limit=1)[0]["PictureActive"],
                               category=category)

            if image:
                res_image = image
        except Exception:
            pass

        try:
            res_name = item.find_all(name="Shop",
                                     limit=1)[0]["Label"]
        except Exception:
            pass

        # shopdata:
        try:
            res_sity = DATA["shopdata"][item["ID"]]
        except Exception:
            pass

        if res_image and res_name and (item["ID"] in DATA["shopdata"]) and (res_name in DATA["english"]):
            return {"image": res_image,
                    "name": res_name,
                    "sity": res_sity}
    except Exception:
        return None


@Parser(category="Totem",
        description="Тотемы")
def totem(item, category):
    try:
        res_image, res_name, res_sity = "", "", []

        # gameobjectdata:
        try:
            image = load_image(image=item.find_all(name="Production",
                                                   limit=1)[0]["ShopIcon"],
                               category=category)

            if image:
                res_image = image
        except Exception:
            pass

        try:
            res_name = item.find_all(name="Name",
                                     limit=1)[0]["Unlocal"]
        except Exception:
            pass

        # shopdata:
        try:
            res_sity = DATA["shopdata"][item["ID"]]
        except Exception:
            pass

        if res_image and res_name and (item["ID"] in DATA["shopdata"]) and (res_name in DATA["english"]):
            return {"image": res_image,
                    "name": res_name,
                    "sity": res_sity}
    except Exception:
        return None


@Parser(category="Decore",
        description="Декорации")
def decore(item, category):
    try:
        res_image, res_name, res_sity = "", "", []

        # gameobjectdata:
        try:
            image = load_image(image=item.find_all(name="Shop",
                                                   limit=1)[0]["Icon"],
                               category=category)

            if image:
                res_image = image
        except Exception:
            pass

        try:
            res_name = item.find_all(name="Name",
                                     limit=1)[0]["Unlocal"]
        except Exception:
            pass

        # shopdata:
        try:
            res_sity = DATA["shopdata"][item["ID"]]
        except Exception:
            pass

        if res_image and res_name and (item["ID"] in DATA["shopdata"]) and (res_name in DATA["english"]):
            return {"image": res_image,
                    "name": res_name,
                    "sity": res_sity}
    except Exception:
        return None
