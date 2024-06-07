import sha256 from "crypto-js/sha256";
import {XMLParser} from "fast-xml-parser";

import {createElement, createMessage, titleCase} from "./utils";
import {createTable, loadLanguageFile, loadUserData} from "./mlplist";
import {findOne, insertOne, updateOne} from "./mongo";

export class createMenu {
    constructor(name, button) {
        this.button = button;

        document.body.appendChild(createElement("div", {
            class: "menu"
        }, (el) => {
            this.button.addEventListener("click", () => {
                el.style.display = "flex";
            });

            el.addEventListener("click", (event) => {
                if (event.target === el) {
                    el.style.display = "none";
                }
            });

            el.appendChild(createElement("div", {
                class: "menu_block"
            }, (el2) => {
                el2.appendChild(createElement("div", {
                    class: "menu_block_header"
                }, (el3) => {
                    el3.appendChild(createElement("span", {}, (el4) => {
                        el4.innerText = name;

                        this.name = el4;
                    }));

                    el3.appendChild(createElement("input", {
                        class: "menu_block_header_close",
                        type: "button",
                        value: "X"
                    }, (el4) => {
                        el4.addEventListener("click", () => {
                            el.style.display = "none";
                        });
                    }));
                }));

                el2.appendChild(createElement("div", {
                    class: "menu_block_content"
                }, (el3) => {
                    this.content = el3;
                }));
            }));
        }));
    }

    appendChild(el) {
        this.content.appendChild(el);
    }

    changeName(name) {
        this.name.innerText = name;
        this.button.value = name;
    }
}

export function createCategoriesMenu() {
    let xhr = new XMLHttpRequest();

    xhr.open("GET", "_resources/data/categoryes.json", false);

    xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
            this.root.categoriesData = JSON.parse(xhr.responseText);

            this.root.categoriesMenu = new createMenu("Список", document.getElementById("header_lists"));

            for (let item in this.root.categoriesData) {
                try {
                    this.root.categoriesMenu.appendChild(createElement("label", {
                        class: "menu_block_content_item"
                    }, (el) => {
                        el.appendChild(createElement("input", {
                            class: "menu_filter_input",
                            type: "radio",
                            name: "categories"
                        }, (el3) => {
                            if (this.root.categoriesData[item]["page"] === decodeURIComponent(this.getURL.searchParams.get("page"))) {
                                el3.checked = "true";

                                this.root.categoriesMenu.changeName("Список: " + item);

                                this.title.update({
                                    category: item,
                                    all: Object.keys(this.root.categoriesData[item]["data"]).length
                                });
                            }

                            el3.addEventListener("change", () => {
                                if (decodeURIComponent(this.getURL.searchParams.get("page")) !== this.root.categoriesData[item]["page"]) {
                                    this.root.loading.style.display = "flex";

                                    this.getURL.searchParams.set("page", encodeURIComponent(this.root.categoriesData[item]["page"]));

                                    history.pushState(null, null, this.getURL.href);

                                    this.title.update({
                                        category: item,
                                        all: Object.keys(this.root.categoriesData[item]["data"]).length
                                    });

                                    this.root.categoriesMenu.changeName("Список: " + item);

                                    createTable.call(this);
                                }
                            });
                        }));

                        el.appendChild(createElement("span", {}, (el2) => {
                            el2.innerText = item;
                        }));
                    }));
                } catch (e) {
                    console.error(e);
                }
            }
        } else {
            setTimeout(() => {
                createCategoriesMenu.call(this);
            }, 1000);
        }
    });

    xhr.addEventListener("error", () => {
        setTimeout(() => {
            createCategoriesMenu.call(this);
        }, 1000);
    });

    xhr.send();
}

export function createLanguagesMenu() {
    let xhr = new XMLHttpRequest();

    xhr.open("GET", "_resources/data/languages.json", false);

    xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
            this.root.languagesData = JSON.parse(xhr.responseText);

            this.root.languagesMenu = new createMenu("Язык", document.getElementById("header_languages"));

            for (let item in this.root.languagesData) {
                try {
                    this.root.languagesMenu.appendChild(createElement("label", {
                        class: "menu_block_content_item"
                    }, (el) => {
                        el.appendChild(createElement("input", {
                            class: "menu_filter_input",
                            type: "radio",
                            name: "languages"
                        }, (el3) => {
                            if (this.root.languagesData[item].slice(0, -5) === decodeURIComponent(this.getURL.searchParams.get("language"))) {
                                el3.checked = "true";

                                this.root.languagesMenu.changeName("Язык: " + item);

                                loadLanguageFile.call(this);
                            }

                            el3.addEventListener("change", () => {
                                if (this.root.languagesData[item].slice(0, -5) !== decodeURIComponent(this.getURL.searchParams.get("language"))) {
                                    this.root.loading.style.display = "flex";

                                    this.getURL.searchParams.set("language", encodeURIComponent(this.root.languagesData[item].slice(0, -5)));

                                    history.pushState(null, null, this.getURL.href);

                                    this.root.languagesMenu.changeName("Язык: " + item);

                                    loadLanguageFile.call(this);
                                    createTable.call(this);
                                    createFilterMenu.call(this);
                                }
                            });
                        }));

                        el.appendChild(createElement("span", {}, (el2) => {
                            el2.innerText = item;
                        }));
                    }));
                } catch (e) {
                    console.error(e);
                }
            }
        } else {
            setTimeout(() => {
                createLanguagesMenu.call(this);
            }, 1000);
        }
    });

    xhr.addEventListener("error", () => {
        setTimeout(() => {
            createLanguagesMenu.call(this);
        }, 1000);
    });

    xhr.send();
}

export function createFilterMenu() {
    let urlFilterData = [];

    if (this.getURL.searchParams.has("filter")) {
        urlFilterData = JSON.parse(decodeURIComponent(this.getURL.searchParams.get("filter")));
    }

    if (!this.root.filterMenuTrigger) {
        this.root.filterMenu = new createMenu("Фильтр", document.getElementById("header_filter"));

        this.root.filterMenu.appendChild(createElement("fieldset", {
            class: "menu_filter_fieldset"
        }, (el) => {
            el.appendChild(createElement("legend", {
                class: "menu_filter_legend"
            }, (el2) => {
                el2.innerText = "Основное";
            }));

            let available = createElement("input", {
                class: "menu_filter_input",
                type: "checkbox"
            }, (el3) => {
                if (urlFilterData.includes(1)) {
                    let pos = urlFilterData.indexOf(2);

                    if (pos !== -1) {
                        urlFilterData.splice(pos, 1);
                    }

                    el3.checked = "true";

                    this.root.filter.available = true;
                }

                el3.addEventListener("change", () => {
                    this.root.loading.style.display = "flex";

                    if (el3.checked) {
                        let pos = urlFilterData.indexOf(2);

                        if (pos !== -1) {
                            urlFilterData.splice(pos, 1);
                        }

                        urlFilterData.push(1);

                        not_available.checked = false;

                        this.root.filter.available = true;
                    } else {
                        let pos = urlFilterData.indexOf(1);

                        if (pos !== -1) {
                            urlFilterData.splice(pos, 1);
                        }

                        this.root.filter.available = null;
                    }

                    if (urlFilterData.length > 0) {
                        this.getURL.searchParams.set("filter", encodeURIComponent(JSON.stringify(urlFilterData)));
                    } else {
                        if (this.getURL.searchParams.has("filter")) {
                            this.getURL.searchParams.delete("filter");
                        }
                    }

                    history.pushState(null, null, this.getURL.href);

                    createTable.call(this);
                });
            });

            let not_available = createElement("input", {
                class: "menu_filter_input",
                type: "checkbox"
            }, (el3) => {
                if (urlFilterData.includes(2)) {
                    let pos = urlFilterData.indexOf(1);

                    if (pos !== -1) {
                        urlFilterData.splice(pos, 1);
                    }

                    el3.checked = "true";

                    this.root.filter.available = false;
                }

                el3.addEventListener("change", () => {
                    this.root.loading.style.display = "flex";

                    if (el3.checked) {
                        let pos = urlFilterData.indexOf(1);

                        if (pos !== -1) {
                            urlFilterData.splice(pos, 1);
                        }

                        urlFilterData.push(2);

                        available.checked = false;

                        this.root.filter.available = false;
                    } else {
                        let pos = urlFilterData.indexOf(2);

                        if (pos !== -1) {
                            urlFilterData.splice(pos, 1);
                        }

                        this.root.filter.available = null;
                    }

                    if (urlFilterData.length > 0) {
                        this.getURL.searchParams.set("filter", encodeURIComponent(JSON.stringify(urlFilterData)));
                    } else {
                        if (this.getURL.searchParams.has("filter")) {
                            this.getURL.searchParams.delete("filter");
                        }
                    }

                    history.pushState(null, null, this.getURL.href);

                    createTable.call(this);
                });
            });

            el.appendChild(createElement("label", {
                class: "menu_block_content_item"
            }, (el2) => {
                el2.appendChild(available);

                el2.appendChild(createElement("span", {}, (el3) => {
                    el3.innerText = "Есть в наличии";
                }));
            }));

            el.appendChild(createElement("label", {
                class: "menu_block_content_item"
            }, (el2) => {
                el2.appendChild(not_available);

                el2.appendChild(createElement("span", {}, (el3) => {
                    el3.innerText = "Нет в наличии";
                }));
            }));
        }));

        this.root.filterMenu.appendChild(createElement("fieldset", {
            class: "menu_filter_fieldset"
        }, (el) => {
            el.appendChild(createElement("legend", {
                class: "menu_filter_legend"
            }, (el2) => {
                el2.innerText = "Города";
            }));

            el.appendChild(createElement("div", {}, (el2) => {
                this.root.filterMenuContent = el2;
            }));
        }));

        this.root.filterMenuTrigger = true;
    }

    let xhr = new XMLHttpRequest();

    xhr.open("GET", "_resources/data/mapzones.json", false);

    xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
            let mapzones = JSON.parse(xhr.responseText);

            this.root.filterMenuContent.innerHTML = "";

            let i = 3;

            for (let item in mapzones) {
                try {
                    let index = i;

                    this.root.filterMenuContent.appendChild(createElement("label", {
                        class: "menu_block_content_item"
                    }, (el2) => {
                        el2.appendChild(createElement("input", {
                            class: "menu_filter_input",
                            type: "checkbox"
                        }, (el3) => {
                            if (urlFilterData.includes(index)) {
                                el3.checked = "true";

                                this.root.filter.sity = this.root.filter.sity.concat(mapzones[item]);
                            }

                            el3.addEventListener("change", () => {
                                this.root.loading.style.display = "flex";

                                if (el3.checked) {
                                    urlFilterData.push(index);

                                    this.root.filter.sity = this.root.filter.sity.concat(mapzones[item]);
                                } else {
                                    let pos = urlFilterData.indexOf(index);

                                    if (pos !== -1) {
                                        urlFilterData.splice(pos, 1);
                                    }

                                    mapzones[item].forEach((element) => {
                                        try {
                                            let pos = this.root.filter.sity.indexOf(element);

                                            if (pos !== -1) {
                                                this.root.filter.sity.splice(pos, 1);
                                            }
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    });
                                }

                                if (urlFilterData.length > 0) {
                                    this.getURL.searchParams.set("filter", encodeURIComponent(JSON.stringify(urlFilterData)));
                                } else {
                                    if (this.getURL.searchParams.has("filter")) {
                                        this.getURL.searchParams.delete("filter");
                                    }
                                }

                                history.pushState(null, null, this.getURL.href);

                                createTable.call(this);
                            });
                        }));

                        el2.appendChild(createElement("span", {}, (el3) => {
                            el3.innerText = titleCase.call(this, this.root.currentLanguagesData[item]);
                        }));
                    }));
                } catch (e) {
                    console.error(e);
                }

                i += 1;
            }
        } else {
            setTimeout(() => {
                createFilterMenu.call(this);
            }, 1000);
        }
    });

    xhr.addEventListener("error", () => {
        setTimeout(() => {
            createFilterMenu.call(this);
        }, 1000);
    });

    xhr.send();
}

export function createUserMenu() {
    if (!this.root.userMenuTrigger) {
        this.root.userMenu = new createMenu("Вход", document.getElementById("header_login"));

        this.root.userMenu.appendChild(createElement("div", {
            class: "menu_block_content_login"
        }, (el) => {
            el.appendChild(createElement("span", {
                class: "menu_block_content_login_span"
            }, (el2) => {
                el2.innerText = ("На данный момент списки созданы для версии игры " + this.root.version + ".");
            }));

            el.appendChild(createElement("div", {
                class: "menu_block_content_login"
            }, (el2) => {
                this.root.userMenuContent = el2;
            }));
        }));

        this.root.userMenuTrigger = true;
    }

    this.root.userMenuContent.innerHTML = "";

    if (localStorage.getItem("mlplist_user") && localStorage.getItem("mlplist_password")) {
        this.root.userMenu.changeName(localStorage.getItem("mlplist_user"));

        this.root.userMenuContent.appendChild(createElement("input", {
            class: "menu_block_content_login_button",
            type: "button",
            value: "Открыть мой список"
        }, (el) => {
            el.addEventListener("click", () => {
                this.root.loading.style.display = "flex";

                this.getURL.searchParams.delete("user");

                history.pushState(null, null, this.getURL.href);

                loadUserData.call(this);
                createTable.call(this);
            });
        }));

        this.root.userMenuContent.appendChild(createElement("details", {}, (el) => {
            el.appendChild(createElement("summary", {}, (el2) => {
                el2.innerText = "Импортировать сохранение";
            }));

            el.appendChild(createElement("div", {
                class: "menu_block_content menu_block_content_login menu_user_content"
            }, (el2) => {
                let importData = createElement("div", {
                    class: "menu_user_import_data"
                });

                el2.appendChild(createElement("label", {
                    class: "menu_block_content_login"
                }, (el3) => {
                    el3.appendChild(createElement("span", {
                        class: "menu_block_content_login_span"
                    }, (el4) => {
                        el4.innerText = "Если у вас есть XML файл вашего сохранения игры из программы SAVE Converter, вы можете загрузить его сюда, чтобы автоматически добавить в списки всё, что есть у вас в игре.";
                    }));

                    el3.appendChild(createElement("input", {
                        class: "menu_user_savefile",
                        type: "file",
                        accept: ".xml, text/xml, application/xml"
                    }, (el4) => {
                        el4.addEventListener("input", () => {
                            if (el4.files.length !== 0) {
                                try {
                                    importData.innerText = "Чтение...";

                                    let reader = new FileReader();

                                    reader.addEventListener("load", () => {
                                        try {
                                            importData.innerText = "Обработка...";

                                            let parser = new XMLParser({
                                                ignoreAttributes: false,
                                                allowBooleanAttributes: true,

                                                transformTagName: (tagName) => {
                                                    return tagName.toLowerCase();
                                                },
                                                transformAttributeName: (attributeName) => {
                                                    return attributeName.toLowerCase();
                                                },

                                                isArray: (name) => {
                                                    return [
                                                        "profileavataritemidowned",
                                                        "profileavatarframeitemidowned",
                                                        "playercardbackgrounditemidowned",
                                                        "playercardbackgroundframeitemidowned",
                                                        "playercardcutiemarkitemidowned",
                                                        "ownedtheme",
                                                        "ownedrbp",
                                                        "storeditem",
                                                        "mapzone",
                                                        "object",
                                                        "altpony",
                                                        "ownpet",
                                                        "item",
                                                        "collection"
                                                    ].includes(name);
                                                }
                                            });

                                            let saveData = parser.parse(reader.result.toString());

                                            let parseData = {};

                                            for (let cat in this.root.categoriesData) {
                                                try {
                                                    let page = this.root.categoriesData[cat]["page"];

                                                    let dataList = [];

                                                    for (let item in this.root.categoriesData[cat]["data"]) {
                                                        try {
                                                            dataList.push(this.root.categoriesData[cat]["data"][item]["id"]);
                                                        } catch (e) {
                                                            console.error(e);
                                                        }
                                                    }

                                                    if (page === "profileavatar") {
                                                        try {
                                                            saveData["mlp_save"]["playerdata"]["profileavatarselection"]["profileavataritemidowned"].forEach((element) => {
                                                                try {
                                                                    if (!(page in parseData)) {
                                                                        parseData[page] = [];
                                                                    }

                                                                    if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                        parseData[page].push(element["@_id"]);
                                                                    }
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            });
                                                        } catch (e) {
                                                            console.error(e);
                                                        }
                                                    }

                                                    if (page === "profileavatarframe") {
                                                        try {
                                                            saveData["mlp_save"]["playerdata"]["profileavatarselection"]["profileavatarframeitemidowned"].forEach((element) => {
                                                                try {
                                                                    if (!(page in parseData)) {
                                                                        parseData[page] = [];
                                                                    }

                                                                    if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                        parseData[page].push(element["@_id"]);
                                                                    }
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            });
                                                        } catch (e) {
                                                            console.error(e);
                                                        }
                                                    }

                                                    if (page === "playercardbackground") {
                                                        try {
                                                            saveData["mlp_save"]["playerdata"]["playercard"]["playercardbackgrounditemidowned"].forEach((element) => {
                                                                try {
                                                                    if (!(page in parseData)) {
                                                                        parseData[page] = [];
                                                                    }

                                                                    if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                        parseData[page].push(element["@_id"]);
                                                                    }
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            });
                                                        } catch (e) {
                                                            console.error(e);
                                                        }
                                                    }

                                                    if (page === "playercardbackgroundframe") {
                                                        try {
                                                            saveData["mlp_save"]["playerdata"]["playercard"]["playercardbackgroundframeitemidowned"].forEach((element) => {
                                                                try {
                                                                    if (!(page in parseData)) {
                                                                        parseData[page] = [];
                                                                    }

                                                                    if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                        parseData[page].push(element["@_id"]);
                                                                    }
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            });
                                                        } catch (e) {
                                                            console.error(e);
                                                        }
                                                    }

                                                    if (page === "playercardcutiemark") {
                                                        try {
                                                            saveData["mlp_save"]["playerdata"]["playercard"]["playercardcutiemarkitemidowned"].forEach((element) => {
                                                                try {
                                                                    if (!(page in parseData)) {
                                                                        parseData[page] = [];
                                                                    }

                                                                    if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                        parseData[page].push(element["@_id"]);
                                                                    }
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            });
                                                        } catch (e) {
                                                            console.error(e);
                                                        }
                                                    }

                                                    if (page === "theme") {
                                                        try {
                                                            saveData["mlp_save"]["playerdata"]["themes"]["ownedtheme"].forEach((element) => {
                                                                try {
                                                                    if (!(page in parseData)) {
                                                                        parseData[page] = [];
                                                                    }

                                                                    if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                        parseData[page].push(element["@_id"]);
                                                                    }
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            });
                                                        } catch (e) {
                                                            console.error(e);
                                                        }
                                                    }

                                                    if (page === "path") {
                                                        try {
                                                            saveData["mlp_save"]["playerdata"]["roadbuildingpermit"]["ownedrbp"].forEach((element) => {
                                                                try {
                                                                    if (!(page in parseData)) {
                                                                        parseData[page] = [];
                                                                    }

                                                                    if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                        parseData[page].push(element["@_id"]);
                                                                    }
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            });
                                                        } catch (e) {
                                                            console.error(e);
                                                        }
                                                    }

                                                    if (page === "pony") {
                                                        try {
                                                            saveData["mlp_save"]["playerdata"]["storage"]["storeditem"].forEach((element) => {
                                                                try {
                                                                    if (element["@_id"].startsWith("Pony_")) {
                                                                        if (!(page in parseData)) {
                                                                            parseData[page] = [];
                                                                        }

                                                                        if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                            parseData[page].push(element["@_id"]);
                                                                        }
                                                                    }
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            });
                                                        } catch (e) {
                                                            console.error(e);
                                                        }

                                                        try {
                                                            saveData["mlp_save"]["mapzone"].forEach((zone) => {
                                                                try {
                                                                    zone["gameobjects"]["pony_objects"]["object"].forEach((element) => {
                                                                        try {
                                                                            if (!(page in parseData)) {
                                                                                parseData[page] = [];
                                                                            }

                                                                            if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                                parseData[page].push(element["@_id"]);
                                                                            }
                                                                        } catch (e) {
                                                                            console.error(e);
                                                                        }
                                                                    });
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            });
                                                        } catch (e) {
                                                            console.error(e);
                                                        }

                                                        try {
                                                            saveData["mlp_save"]["playerdata"]["ownedalterformofpony"]["altpony"].forEach((element) => {
                                                                try {
                                                                    if (!(page in parseData)) {
                                                                        parseData[page] = [];
                                                                    }

                                                                    if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                        parseData[page].push(element["@_id"]);
                                                                    }
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            });
                                                        } catch (e) {
                                                            console.error(e);
                                                        }
                                                    }

                                                    if (page === "pony_house") {
                                                        try {
                                                            saveData["mlp_save"]["playerdata"]["storage"]["storeditem"].forEach((element) => {
                                                                try {
                                                                    if (element["@_id"].startsWith("House_")) {
                                                                        if (!(page in parseData)) {
                                                                            parseData[page] = [];
                                                                        }

                                                                        if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                            parseData[page].push(element["@_id"]);
                                                                        }
                                                                    }
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            });
                                                        } catch (e) {
                                                            console.error(e);
                                                        }

                                                        try {
                                                            saveData["mlp_save"]["mapzone"].forEach((zone) => {
                                                                try {
                                                                    zone["gameobjects"]["pony_house_objects"]["object"].forEach((element) => {
                                                                        try {
                                                                            if (!(page in parseData)) {
                                                                                parseData[page] = [];
                                                                            }

                                                                            if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                                parseData[page].push(element["@_id"]);
                                                                            }
                                                                        } catch (e) {
                                                                            console.error(e);
                                                                        }
                                                                    });
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            });
                                                        } catch (e) {
                                                            console.error(e);
                                                        }
                                                    }

                                                    if (page === "ponypet") {
                                                        try {
                                                            saveData["mlp_save"]["playerdata"]["storage"]["storeditem"].forEach((element) => {
                                                                try {
                                                                    if (element["@_id"].startsWith("Pet_")) {
                                                                        if (!(page in parseData)) {
                                                                            parseData[page] = [];
                                                                        }

                                                                        if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                            parseData[page].push(element["@_id"]);
                                                                        }
                                                                    }
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            });
                                                        } catch (e) {
                                                            console.error(e);
                                                        }

                                                        try {
                                                            saveData["mlp_save"]["mapzone"].forEach((zone) => {
                                                                try {
                                                                    zone["gameobjects"]["pony_objects"]["object"].forEach((pony) => {
                                                                        try {
                                                                            pony["pet"]["ownpet"].forEach((element) => {
                                                                                try {
                                                                                    if (!(page in parseData)) {
                                                                                        parseData[page] = [];
                                                                                    }

                                                                                    if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                                        parseData[page].push(element["@_id"]);
                                                                                    }
                                                                                } catch (e) {
                                                                                    console.error(e);
                                                                                }
                                                                            });
                                                                        } catch (e) {
                                                                            console.error(e);
                                                                        }
                                                                    });
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            });
                                                        } catch (e) {
                                                            console.error(e);
                                                        }

                                                        try {
                                                            saveData["mlp_save"]["playerdata"]["storage"]["storeditem"].forEach((stored) => {
                                                                try {
                                                                    stored["pet"]["ownpet"].forEach((element) => {
                                                                        try {
                                                                            if (!(page in parseData)) {
                                                                                parseData[page] = [];
                                                                            }

                                                                            if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                                parseData[page].push(element["@_id"]);
                                                                            }
                                                                        } catch (e) {
                                                                            console.error(e);
                                                                        }
                                                                    });
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            });
                                                        } catch (e) {
                                                            console.error(e);
                                                        }
                                                    }

                                                    if (page === "ponyset") {
                                                        try {
                                                            let ponysetData = this.root.categoriesData[cat]["data"];

                                                            let boughtedList = [];

                                                            saveData["mlp_save"]["ponypartsdata"]["boughtedlist"]["item"].forEach((element) => {
                                                                try {
                                                                    if (!boughtedList.includes(element["@_id"])) {
                                                                        boughtedList.push(element["@_id"]);
                                                                    }
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            });

                                                            for (let set in ponysetData) {
                                                                try {
                                                                    if (ponysetData[set]["parts"].every((element) => {
                                                                        return boughtedList.includes(element);
                                                                    })) {
                                                                        if (!(page in parseData)) {
                                                                            parseData[page] = [];
                                                                        }

                                                                        parseData[page].push(ponysetData[set]["id"]);
                                                                    }
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            }
                                                        } catch (e) {
                                                            console.error(e);
                                                        }
                                                    }

                                                    if (page === "collection") {
                                                        try {
                                                            saveData["mlp_save"]["collectiondata"]["completedcollectionlist"]["collection"].forEach((element) => {
                                                                try {
                                                                    if (!(page in parseData)) {
                                                                        parseData[page] = [];
                                                                    }

                                                                    if (!parseData[page].includes(element["@_collectionid"]) && dataList.includes(element["@_collectionid"])) {
                                                                        parseData[page].push(element["@_collectionid"]);
                                                                    }
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            });
                                                        } catch (e) {
                                                            console.error(e);
                                                        }
                                                    }
                                                } catch (e) {
                                                    console.error(e);
                                                }
                                            }

                                            let insertData = {};

                                            importData.innerHTML = "";

                                            if (Object.keys(parseData).length > 0) {
                                                for (let item in this.root.categoriesData) {
                                                    try {
                                                        let page = this.root.categoriesData[item]["page"];

                                                        if ((page in parseData) && (parseData[page].length > 0)) {
                                                            importData.appendChild(createElement("label", {
                                                                class: "menu_user_import_data_label"
                                                            }, (el) => {
                                                                el.appendChild(createElement("input", {
                                                                    type: "checkbox",
                                                                    checked: "true"
                                                                }, (el2) => {
                                                                    insertData[page] = parseData[page];

                                                                    el2.addEventListener("change", () => {
                                                                        if (el2.checked) {
                                                                            insertData[page] = parseData[page];
                                                                        } else {
                                                                            delete insertData[page];
                                                                        }
                                                                    });
                                                                }));

                                                                el.appendChild(createElement("span", {}, (el2) => {
                                                                    el2.innerText = (item + " (найдено: " + parseData[page].length + ")");
                                                                }));
                                                            }));
                                                        }
                                                    } catch (e) {
                                                        console.error(e);
                                                    }
                                                }

                                                importData.appendChild(createElement("span", {
                                                    class: "menu_block_content_login_span"
                                                }, (el) => {
                                                    el.innerText = "Внимание: импорт заменит все старые данные в выбранных категориях!";
                                                }));

                                                importData.appendChild(createElement("input", {
                                                    class: "menu_block_content_login_button",
                                                    type: "button",
                                                    value: "Импортировать"
                                                }, (el) => {
                                                    el.style.width = "auto";

                                                    el.addEventListener("click", () => {
                                                        if (Object.keys(insertData).length > 0) {
                                                            if (updateOne.call(this, {
                                                                "_id": localStorage.getItem("mlplist_user"),
                                                                "password": localStorage.getItem("mlplist_password")
                                                            }, {
                                                                "$set": insertData
                                                            })) {
                                                                this.root.loading.style.display = "flex";

                                                                importData.innerHTML = "";
                                                                el4.value = null;

                                                                createMessage.call(this, "info", "Данные успешно импортированы.");

                                                                loadUserData.call(this);
                                                                createTable.call(this);
                                                            } else {
                                                                createMessage.call(this, "error", "Ошибка соединения! Попробуйте еще раз...");
                                                            }
                                                        } else {
                                                            createMessage.call(this, "alert", "Должна быть выбрана хотябы одна категория!");
                                                        }
                                                    });
                                                }));
                                            } else {
                                                importData.innerText = "Обработка завершена. Ничего не найдено.";
                                            }
                                        } catch (e) {
                                            console.error(e);
                                            importData.innerText = "Во время обработки файла возникла ошибка. Возможно неверный файл, или данные в нем повреждены...";
                                        }
                                    });

                                    reader.readAsText(el4.files[0]);
                                } catch (e) {
                                    console.error(e);
                                    importData.innerText = "Во время чтения файла возникла ошибка. Возможно неверный файл, или данные в нем повреждены...";
                                }
                            } else {
                                importData.innerHTML = "";
                            }
                        });
                    }));
                }));

                el2.appendChild(importData);
            }));
        }));

        this.root.userMenuContent.appendChild(createElement("details", {}, (el) => {
            el.appendChild(createElement("summary", {}, (el2) => {
                el2.innerText = "Сменить пароль";
            }));

            el.appendChild(createElement("form", {
                class: "menu_block_content menu_block_content_login menu_user_content",
                action: "javascript:"
            }, (el2) => {
                let passwordOld = createElement("input", {
                    class: "menu_block_content_login_input",
                    type: "password",
                    required: "true"
                });

                el2.appendChild(createElement("label", {
                    class: "menu_block_content_login"
                }, (el3) => {
                    el3.appendChild(createElement("span", {
                        class: "menu_block_content_login_span"
                    }, (el4) => {
                        el4.innerText = "Старый пароль:";
                    }));

                    el3.appendChild(passwordOld);
                }));

                let passwordNew = createElement("input", {
                    class: "menu_block_content_login_input",
                    type: "password",
                    required: "true"
                });

                el2.appendChild(createElement("label", {
                    class: "menu_block_content_login"
                }, (el3) => {
                    el3.appendChild(createElement("span", {
                        class: "menu_block_content_login_span"
                    }, (el4) => {
                        el4.innerText = "Новый пароль:";
                    }));

                    el3.appendChild(passwordNew);
                }));

                let passwordNew2 = createElement("input", {
                    class: "menu_block_content_login_input",
                    type: "password",
                    required: "true"
                });

                el2.appendChild(createElement("label", {
                    class: "menu_block_content_login"
                }, (el3) => {
                    el3.appendChild(createElement("span", {
                        class: "menu_block_content_login_span"
                    }, (el4) => {
                        el4.innerText = "Повтор нового пароля:";
                    }));

                    el3.appendChild(passwordNew2);
                }));

                el2.appendChild(createElement("input", {
                    class: "menu_block_content_login_button",
                    type: "submit",
                    value: "Сменить"
                }));

                el2.addEventListener("submit", () => {
                    let password_old = sha256(passwordOld.value).toString();
                    let password_new = sha256(passwordNew.value).toString();
                    let password_new_2 = sha256(passwordNew2.value).toString();

                    if (password_new !== password_new_2) {
                        createMessage.call(this, "alert", "Новые пароли не совпадают!");

                        return null;
                    }

                    let user = findOne.call(this, {
                        "_id": localStorage.getItem("mlplist_user"),
                        "password": password_old
                    });

                    if (user === null) {
                        createMessage.call(this, "error", "Ошибка соединения! Попробуйте еще раз...");

                        return null;
                    }

                    if (user) {
                        if (updateOne.call(this, {
                            "_id": localStorage.getItem("mlplist_user"),
                            "password": password_old
                        }, {
                            "$set": {
                                "password": password_new
                            }
                        })) {
                            passwordOld.value = "";
                            passwordNew.value = "";
                            passwordNew2.value = "";

                            createMessage.call(this, "info", "Пароль успешно изменен! Требуется повторный вход!");

                            this.root.loading.style.display = "flex";

                            localStorage.removeItem("mlplist_user");
                            localStorage.removeItem("mlplist_password");

                            createMessage.call(this, "info", "Вы вышли из аккаунта");

                            createUserMenu.call(this);
                            createTable.call(this);
                        } else {
                            createMessage.call(this, "error", "Ошибка соединения! Попробуйте еще раз...");
                        }
                    } else {
                        createMessage.call(this, "alert", "Старый пароль неверный!");
                    }
                });
            }));
        }));

        this.root.userMenuContent.appendChild(createElement("input", {
            class: "menu_block_content_login_button messages_message_error",
            type: "button",
            value: "Выйти"
        }, (el) => {
            el.addEventListener("click", () => {
                this.root.loading.style.display = "flex";

                localStorage.removeItem("mlplist_user");
                localStorage.removeItem("mlplist_password");

                createMessage.call(this, "info", "Вы вышли из аккаунта");

                createUserMenu.call(this);
                createTable.call(this);
            });
        }));
    } else {
        this.root.userMenu.changeName("Вход");

        let loginDiv = createElement("form", {
            class: "menu_block_content_login",
            action: "javascript:"
        }, (el2) => {
            let loginNew = createElement("input", {
                class: "menu_block_content_login_input",
                type: "text",
                required: "true"
            });

            el2.appendChild(createElement("label", {
                class: "menu_block_content_login"
            }, (el3) => {
                el3.appendChild(createElement("span", {
                    class: "menu_block_content_login_span"
                }, (el4) => {
                    el4.innerText = "Логин:";
                }));

                el3.appendChild(loginNew);
            }));

            let passwordNew = createElement("input", {
                class: "menu_block_content_login_input",
                type: "password",
                required: "true"
            });

            el2.appendChild(createElement("label", {
                class: "menu_block_content_login"
            }, (el3) => {
                el3.appendChild(createElement("span", {
                    class: "menu_block_content_login_span"
                }, (el4) => {
                    el4.innerText = "Пароль:";
                }));

                el3.appendChild(passwordNew);
            }));

            el2.appendChild(createElement("input", {
                class: "menu_block_content_login_button",
                type: "submit",
                value: "Вход"
            }));

            el2.addEventListener("submit", () => {
                let login = loginNew.value;
                let password = sha256(passwordNew.value).toString();

                let user = findOne.call(this, {
                    "_id": login,
                    "password": password
                });

                if (user === null) {
                    createMessage.call(this, "error", "Ошибка соединения! Попробуйте еще раз...");

                    return null;
                }

                if (user) {
                    this.root.loading.style.display = "flex";

                    localStorage.setItem("mlplist_user", login);
                    localStorage.setItem("mlplist_password", password);

                    createMessage.call(this, "info", "Добро пожаловать, " + user["_id"]);

                    loadUserData.call(this);
                    createTable.call(this);
                } else {
                    createMessage.call(this, "alert", "Логин/Пароль неверные!");
                }
            });
        });

        let registerDiv = createElement("form", {
            class: "menu_block_content_login",
            action: "javascript:"
        }, (el2) => {
            el2.style.display = "none";

            let loginNew = createElement("input", {
                class: "menu_block_content_login_input",
                type: "text",
                required: "true"
            });

            el2.appendChild(createElement("label", {
                class: "menu_block_content_login"
            }, (el3) => {
                el3.appendChild(createElement("span", {
                    class: "menu_block_content_login_span"
                }, (el4) => {
                    el4.innerText = "Логин:";
                }));

                el3.appendChild(createElement("span", {
                    class: "menu_block_content_login_span_alert"
                }, (el4) => {
                    el4.innerText = "только английские буквы и цифры, без пробелов и символов";
                }));

                el3.appendChild(loginNew);
            }));

            let passwordNew = createElement("input", {
                class: "menu_block_content_login_input",
                type: "password",
                required: "true"
            });

            el2.appendChild(createElement("label", {
                class: "menu_block_content_login"
            }, (el3) => {
                el3.appendChild(createElement("span", {
                    class: "menu_block_content_login_span"
                }, (el4) => {
                    el4.innerText = "Пароль:";
                }));

                el3.appendChild(passwordNew);
            }));

            let passwordNew2 = createElement("input", {
                class: "menu_block_content_login_input",
                type: "password",
                required: "true"
            });

            el2.appendChild(createElement("label", {
                class: "menu_block_content_login"
            }, (el3) => {
                el3.appendChild(createElement("span", {
                    class: "menu_block_content_login_span"
                }, (el4) => {
                    el4.innerText = "Повтор пароля:";
                }));

                el3.appendChild(passwordNew2);
            }));

            el2.appendChild(createElement("input", {
                class: "menu_block_content_login_button",
                type: "submit",
                value: "Регистрация"
            }));

            el2.addEventListener("submit", () => {
                let login = loginNew.value;
                let password = sha256(passwordNew.value).toString();
                let password_2 = sha256(passwordNew2.value).toString();

                if (password !== password_2) {
                    createMessage.call(this, "alert", "Пароли не совпадают!");

                    return null;
                }

                if (!(/^[a-zA-Z0-9]+$/.test(login))) {
                    createMessage.call(this, "alert", "Логин содержит недопустимые символы!");

                    return null;
                }

                let user = findOne.call(this, {
                    "_id": login
                });

                if (user === null) {
                    createMessage.call(this, "error", "Ошибка соединения! Попробуйте еще раз...");

                    return null;
                }

                if (user) {
                    createMessage.call(this, "alert", "Это имя пользователя уже занято!");
                } else {
                    if (insertOne.call(this, {
                        "_id": login,
                        "password": password
                    })) {
                        this.root.loading.style.display = "flex";

                        localStorage.setItem("mlplist_user", login);
                        localStorage.setItem("mlplist_password", password);

                        createMessage.call(this, "info", "Регистрация успешна!");
                        createMessage.call(this, "info", "Добро пожаловать, " + login);

                        loadUserData.call(this);
                        createTable.call(this);
                    } else {
                        createMessage.call(this, "error", "Во время регистрации произошла ошибка!");
                    }
                }
            });
        });

        this.root.userMenuContent.appendChild(createElement("div", {
            class: "menu_block_content_login_tabmenu"
        }, (el) => {
            let login = createElement("input", {
                class: "menu_block_content_login_button",
                type: "button",
                value: "Вход"
            }, (el) => {
                el.addEventListener("click", () => {
                    this.root.userMenu.changeName("Вход");

                    el.classList.remove("menu_block_content_login_tabmenu_tab_inactive");
                    register.classList.add("menu_block_content_login_tabmenu_tab_inactive");

                    loginDiv.style.display = "flex";
                    registerDiv.style.display = "none";
                });
            });

            let register = createElement("input", {
                class: "menu_block_content_login_button menu_block_content_login_tabmenu_tab_inactive",
                type: "button",
                value: "Регистрация"
            }, (el) => {
                el.addEventListener("click", () => {
                    this.root.userMenu.changeName("Регистрация");

                    el.classList.remove("menu_block_content_login_tabmenu_tab_inactive");
                    login.classList.add("menu_block_content_login_tabmenu_tab_inactive");

                    registerDiv.style.display = "flex";
                    loginDiv.style.display = "none";
                });
            });

            el.appendChild(login);
            el.appendChild(register);
        }));

        this.root.userMenuContent.appendChild(loginDiv);
        this.root.userMenuContent.appendChild(registerDiv);
    }
}

export function createSortMenu() {
    this.root.sortMenu = new createMenu("Сортировка", document.getElementById("header_sort"));

    this.root.sortMenu.appendChild(createElement("fieldset", {
        class: "menu_filter_fieldset"
    }, (el) => {
        el.appendChild(createElement("legend", {
            class: "menu_filter_legend"
        }, (el2) => {
            el2.innerText = "Номер";
        }));

        el.appendChild(createElement("label", {
            class: "menu_block_content_item"
        }, (el2) => {
            el2.appendChild(createElement("input", {
                class: "menu_filter_input",
                type: "radio",
                name: "sort"
            }, (el3) => {
                if (decodeURIComponent(this.getURL.searchParams.get("sort")) === "numas") {
                    el3.checked = "true";

                    this.root.sortMenu.changeName("Сортировка: Номер ↓");

                    this.root.sorts.name = null;

                    this.root.sorts.reverse = false;
                }

                el3.addEventListener("change", () => {
                    if (decodeURIComponent(this.getURL.searchParams.get("sort")) !== "numas") {
                        this.root.loading.style.display = "flex";

                        this.getURL.searchParams.set("sort", encodeURIComponent("numas"));

                        history.pushState(null, null, this.getURL.href);

                        this.root.sortMenu.changeName("Сортировка: Номер ↓");

                        this.root.sorts.name = null;

                        this.root.sorts.reverse = false;

                        createTable.call(this);
                    }
                });
            }));

            el2.appendChild(createElement("span", {}, (el3) => {
                el3.innerText = "По возрастанию";
            }));
        }));

        el.appendChild(createElement("label", {
            class: "menu_block_content_item"
        }, (el2) => {
            el2.appendChild(createElement("input", {
                class: "menu_filter_input",
                type: "radio",
                name: "sort"
            }, (el3) => {
                if (decodeURIComponent(this.getURL.searchParams.get("sort")) === "numdes") {
                    el3.checked = "true";

                    this.root.sortMenu.changeName("Сортировка: Номер ↑");

                    this.root.sorts.name = null;

                    this.root.sorts.reverse = true;
                }

                el3.addEventListener("change", () => {
                    if (decodeURIComponent(this.getURL.searchParams.get("sort")) !== "numdes") {
                        this.root.loading.style.display = "flex";

                        this.getURL.searchParams.set("sort", encodeURIComponent("numdes"));

                        history.pushState(null, null, this.getURL.href);

                        this.root.sortMenu.changeName("Сортировка: Номер ↑");

                        this.root.sorts.name = null;

                        this.root.sorts.reverse = true;

                        createTable.call(this);
                    }
                });
            }));

            el2.appendChild(createElement("span", {}, (el3) => {
                el3.innerText = "По убыванию";
            }));
        }));
    }));

    this.root.sortMenu.appendChild(createElement("fieldset", {
        class: "menu_filter_fieldset"
    }, (el) => {
        el.appendChild(createElement("legend", {
            class: "menu_filter_legend"
        }, (el2) => {
            el2.innerText = "Имя";
        }));

        el.appendChild(createElement("label", {
            class: "menu_block_content_item"
        }, (el2) => {
            el2.appendChild(createElement("input", {
                class: "menu_filter_input",
                type: "radio",
                name: "sort"
            }, (el3) => {
                if (decodeURIComponent(this.getURL.searchParams.get("sort")) === "nameas") {
                    el3.checked = "true";

                    this.root.sortMenu.changeName("Сортировка: Имя ↓");

                    this.root.sorts.reverse = false;

                    this.root.sorts.name = true;
                }

                el3.addEventListener("change", () => {
                    if (decodeURIComponent(this.getURL.searchParams.get("sort")) !== "nameas") {
                        this.root.loading.style.display = "flex";

                        this.getURL.searchParams.set("sort", encodeURIComponent("nameas"));

                        history.pushState(null, null, this.getURL.href);

                        this.root.sortMenu.changeName("Сортировка: Имя ↓");

                        this.root.sorts.reverse = false;

                        this.root.sorts.name = true;

                        createTable.call(this);
                    }
                });
            }));

            el2.appendChild(createElement("span", {}, (el3) => {
                el3.innerText = "По возрастанию";
            }));
        }));

        el.appendChild(createElement("label", {
            class: "menu_block_content_item"
        }, (el2) => {
            el2.appendChild(createElement("input", {
                class: "menu_filter_input",
                type: "radio",
                name: "sort"
            }, (el3) => {
                if (decodeURIComponent(this.getURL.searchParams.get("sort")) === "namedes") {
                    el3.checked = "true";

                    this.root.sortMenu.changeName("Сортировка: Имя ↑");

                    this.root.sorts.reverse = false;

                    this.root.sorts.name = false;
                }

                el3.addEventListener("change", () => {
                    if (decodeURIComponent(this.getURL.searchParams.get("sort")) !== "namedes") {
                        this.root.loading.style.display = "flex";

                        this.getURL.searchParams.set("sort", encodeURIComponent("namedes"));

                        history.pushState(null, null, this.getURL.href);

                        this.root.sortMenu.changeName("Сортировка: Имя ↑");

                        this.root.sorts.reverse = false;

                        this.root.sorts.name = false;

                        createTable.call(this);
                    }
                });
            }));

            el2.appendChild(createElement("span", {}, (el3) => {
                el3.innerText = "По убыванию";
            }));
        }));
    }));
}

export function createStyleMenu() {
    let content = document.getElementById("content");

    this.root.styleMenu = new createMenu("Вид", document.getElementById("header_style"));

    this.root.styleMenu.appendChild(createElement("label", {
        class: "menu_block_content_item"
    }, (el) => {
        el.appendChild(createElement("input", {
            class: "menu_filter_input",
            type: "radio",
            name: "style"
        }, (el2) => {
            if (decodeURIComponent(this.getURL.searchParams.get("style")) === "tiles") {
                el2.checked = "true";

                this.root.styleMenu.changeName("Вид: Плитки");

                content.setAttribute("line", "false");
            }

            el2.addEventListener("change", () => {
                if (decodeURIComponent(this.getURL.searchParams.get("style")) !== "tiles") {
                    this.getURL.searchParams.set("style", encodeURIComponent("tiles"));

                    history.pushState(null, null, this.getURL.href);

                    this.root.styleMenu.changeName("Вид: Плитки");

                    content.setAttribute("line", "false");
                }
            });
        }));

        el.appendChild(createElement("span", {}, (el2) => {
            el2.innerText = "Плитки";
        }));
    }));

    this.root.styleMenu.appendChild(createElement("label", {
        class: "menu_block_content_item"
    }, (el) => {
        el.appendChild(createElement("input", {
            class: "menu_filter_input",
            type: "radio",
            name: "style"
        }, (el2) => {
            if (decodeURIComponent(this.getURL.searchParams.get("style")) === "list") {
                el2.checked = "true";

                this.root.styleMenu.changeName("Вид: Список");

                content.setAttribute("line", "true");
            }

            el2.addEventListener("change", () => {
                if (decodeURIComponent(this.getURL.searchParams.get("style")) !== "list") {
                    this.getURL.searchParams.set("style", encodeURIComponent("list"));

                    history.pushState(null, null, this.getURL.href);

                    this.root.styleMenu.changeName("Вид: Список");

                    content.setAttribute("line", "true");
                }
            });
        }));

        el.appendChild(createElement("span", {}, (el2) => {
            el2.innerText = "Список";
        }));
    }));
}
