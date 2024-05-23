DATA = {}


def load_image(image, category):
    try:
        image = image.replace("gui/",
                              "").replace(".png",
                                          "")

        with open(file=DATA["images"][image],
                  mode="rb") as image_file:
            if "hosting" not in DATA:
                DATA.update({"hosting": {category: {f"{image}.png": image_file.read()}}})
            else:
                if category not in DATA["hosting"]:
                    DATA["hosting"].update({category: {f"{image}.png": image_file.read()}})
                else:
                    DATA["hosting"][category].update({f"{image}.png": image_file.read()})

            return f"{image}.png"
    except Exception:
        return None
