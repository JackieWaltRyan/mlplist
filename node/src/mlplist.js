import {findOne, updateOne} from "./mongo";
import {createElement, createMessage, updateTitle, zoomIn, zoomOut} from "./utils";
import {
    createCategoriesMenu,
    createFilterMenu,
    createLanguagesMenu,
    createSortMenu,
    createStyleMenu,
    createUserMenu
} from "./menu";

export function init() {
    this.getURL = new URL(location.href);
    this.title = new updateTitle();

    this.root = {
        loading: document.getElementById("loading"),

        searchTimeout: null,

        filter: {
            available: null,
            sity: []
        },

        sorts: {
            reverse: false,
            name: null
        }
    };

    if (!this.getURL.searchParams.has("page")) {
        this.getURL.searchParams.set("page", encodeURIComponent("profileavatar"));
    }

    if (!this.getURL.searchParams.has("language")) {
        this.getURL.searchParams.set("language", encodeURIComponent("russian"));
    }

    if (!this.getURL.searchParams.has("sort")) {
        this.getURL.searchParams.set("sort", encodeURIComponent("numas"));
    }

    if (!this.getURL.searchParams.has("style")) {
        this.getURL.searchParams.set("style", encodeURIComponent("tiles"));
    }

    history.pushState(null, null, this.getURL.href);

    createCategoriesMenu.call(this);
    createLanguagesMenu.call(this);
    createFilterMenu.call(this);
    createSortMenu.call(this);
    createStyleMenu.call(this);

    document.getElementById("header_search").addEventListener("input", (event) => {
        clearTimeout(this.root.searchTimeout);

        this.root.searchTimeout = setTimeout(() => {
            this.root.loading.style.display = "flex";

            if (event["target"]["value"]) {
                this.getURL.searchParams.set("search", encodeURIComponent(event["target"]["value"]));

                history.pushState(null, null, this.getURL.href);
            } else {
                if (this.getURL.searchParams.has("search")) {
                    this.getURL.searchParams.delete("search");

                    history.pushState(null, null, this.getURL.href);
                }
            }

            createTable.call(this);
        }, 2000);
    });

    loadVersion.call(this);
    loadUserData.call(this);

    createTable.call(this);
}

export function loadLanguageFile() {
    let xhr = new XMLHttpRequest();

    xhr.open("GET", ("_resources/data/languages/" + decodeURIComponent(this.getURL.searchParams.get("language")) + ".json"), false);

    xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
            this.root.currentLanguagesData = JSON.parse(xhr.responseText);
        } else {
            setTimeout(() => {
                loadLanguageFile.call(this);
            }, 1000);
        }
    });

    xhr.addEventListener("error", () => {
        setTimeout(() => {
            loadLanguageFile.call(this);
        }, 1000);
    });

    xhr.send();
}

export function loadUserData() {
    if (!this.getURL.searchParams.has("user")) {
        if (localStorage.getItem("mlplist_user")) {
            this.getURL.searchParams.set("user", localStorage.getItem("mlplist_user"));

            history.pushState(null, null, this.getURL.href);
        }
    }

    if (this.getURL.searchParams.has("user")) {
        this.root.userData = findOne.call(this, {
            "_id": decodeURIComponent(this.getURL.searchParams.get("user"))
        });

        if (this.root.userData === null) {
            createMessage.call(this, "error", "Ошибка соединения! Повторная попытка...");

            setTimeout(() => {
                loadUserData.call(this);
            }, 1000);

            return null;
        }

        if (this.root.userData) {
            let headerTitle = document.getElementById("header_title");

            headerTitle.style.display = "block";
            headerTitle.innerText = ("Список пользователя " + this.root.userData["_id"]);

            this.title.update({
                user: this.root.userData["_id"]
            });

            if (this.root.userData["_id"] === localStorage.getItem("mlplist_user")) {
                let admin = findOne.call(this, {
                    "password": localStorage.getItem("mlplist_password")
                });

                if (admin) {
                    if (this.root.userData["_id"] === admin["_id"]) {
                        this.root.userData["password"] = localStorage.getItem("mlplist_password");
                    }
                }
            }

            createTable.call(this);
        } else {
            if (this.getURL.searchParams.has("user")) {
                this.getURL.searchParams.delete("user");

                history.pushState(null, null, this.getURL.href);

                this.title.update({
                    user: null
                });

                loadUserData.call(this);
            }
        }

        createUserMenu.call(this);
    } else {
        this.title.update({
            user: null
        });

        createUserMenu.call(this);
    }
}

export function loadVersion() {
    let xhr = new XMLHttpRequest();

    xhr.open("GET", "_resources/data/version.json", false);

    xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
            this.root.version = JSON.parse(xhr.responseText)["version"];
        }
    });

    xhr.send();
}

export function createTable() {
    let content = document.getElementById("content");

    content.innerHTML = "";

    if (!this.root.currentLanguagesData) {
        loadLanguageFile.call(this);

        setTimeout(() => {
            createTable.call(this);
        }, 1000);

        return null;
    }

    for (let cat in this.root.categoriesData) {
        try {
            let page = decodeURIComponent(this.getURL.searchParams.get("page"));

            if (this.root.categoriesData[cat]["page"] === page) {
                let catData = this.root.categoriesData[cat]["data"];

                let itemList = Object.keys(catData).sort((a, b) => {
                    return (parseInt(a) - parseInt(b));
                });

                if (this.root.sorts.reverse) {
                    itemList = itemList.reverse();
                }

                if (this.root.sorts.name !== null) {
                    itemList = Object.keys(catData).sort((a, b) => {
                        if (this.root.currentLanguagesData[catData[a]["name"]] > this.root.currentLanguagesData[catData[b]["name"]]) {
                            return 1;
                        }

                        if (this.root.currentLanguagesData[catData[a]["name"]] < this.root.currentLanguagesData[catData[b]["name"]]) {
                            return -1;
                        }

                        return 0;
                    });

                    if (this.root.sorts.name === false) {
                        itemList = itemList.reverse();
                    }
                }

                let add = 0;

                for (let item of itemList) {
                    try {
                        if (this.root.userData && (page in this.root.userData)) {
                            if (this.root.userData[page].includes(catData[item]["id"])) {
                                add += 1;
                            }
                        }

                        if (this.getURL.searchParams.has("search")) {
                            let search = decodeURIComponent(this.getURL.searchParams.get("search"));

                            let search_input = document.getElementById("header_search");

                            if (search_input.value !== search) {
                                search_input.value = search;
                            }

                            let text = (item + this.root.currentLanguagesData[catData[item]["name"]]);

                            if (!search.split(",").find((item) => {
                                return text.toLowerCase().includes(item.trim().toLowerCase());
                            })) {
                                continue;
                            }
                        }

                        if (!this.root.currentLanguagesData[catData[item]["name"]]) {
                            continue;
                        }

                        if ((this.root.filter.available !== null) && this.root.userData && (page in this.root.userData)) {
                            if (this.root.filter.available !== this.root.userData[page].includes(catData[item]["id"])) {
                                continue;
                            }
                        } else {
                            if (this.root.filter.available && !(page in this.root.userData)) {
                                continue;
                            }
                        }

                        if (this.root.filter.sity.length > 0) {
                            let trigger = true;

                            if (!catData[item]["sity"]) {
                                continue;
                            }

                            catData[item]["sity"].forEach((element) => {
                                try {
                                    if (trigger && this.root.filter.sity.includes(element)) {
                                        trigger = false;
                                    }
                                } catch (e) {
                                    console.error(e);
                                }
                            });

                            if (trigger) {
                                continue;
                            }
                        }

                        content.appendChild(createElement("div", {
                            class: "content_item"
                        }, (el) => {
                            el.appendChild(createElement("img", {
                                class: "content_item_image",
                                src: ("_resources/images/" + catData[item]["image"])
                            }, (el2) => {
                                el2.addEventListener("mousemove", (event) => {
                                    zoomIn.call(this, event);
                                });

                                el2.addEventListener("mouseout", () => {
                                    zoomOut.call(this);
                                });
                            }));

                            el.appendChild(createElement("span", {
                                class: "content_item_index copy",
                                title: "Скопировать"
                            }, (el2) => {
                                el2.innerText = item;

                                el2.addEventListener("click", () => {
                                    navigator.clipboard.writeText(el2.innerText).then(r => r);
                                });
                            }));

                            el.appendChild(createElement("span", {
                                class: "content_item_name copy",
                                title: "Скопировать"
                            }, (el2) => {
                                el2.innerText = this.root.currentLanguagesData[catData[item]["name"]];

                                el2.addEventListener("click", () => {
                                    navigator.clipboard.writeText(el2.innerText).then(r => r);
                                });
                            }));

                            if (this.root.userData) {
                                if ((page in this.root.userData) && this.root.userData[page].includes(catData[item]["id"])) {
                                    el.classList.add("content_item_green");
                                }

                                if ((this.root.userData["_id"] === localStorage.getItem("mlplist_user")) && (this.root.userData["password"] === localStorage.getItem("mlplist_password"))) {
                                    el.appendChild(createElement("input", {
                                        class: "content_item_button",
                                        type: "button"
                                    }, (el2) => {
                                        if ((page in this.root.userData) && this.root.userData[page].includes(catData[item]["id"])) {
                                            el2.classList.add("content_item_button_red");
                                            el2.value = "Удалить";
                                        } else {
                                            el2.classList.add("content_item_button_green");
                                            el2.value = "Добавить";
                                        }

                                        el2.addEventListener("click", () => {
                                            let data = {};
                                            data[page] = catData[item]["id"];

                                            if ((page in this.root.userData) && this.root.userData[page].includes(catData[item]["id"])) {
                                                if (updateOne.call(this, {
                                                    "_id": this.root.userData["_id"],
                                                    "password": localStorage.getItem("mlplist_password")
                                                }, {
                                                    "$pull": data
                                                })) {
                                                    let pos = this.root.userData[page].indexOf(catData[item]["id"]);

                                                    if (pos !== -1) {
                                                        this.root.userData[page].splice(pos, 1);
                                                    }

                                                    el.classList.remove("content_item_green");

                                                    el2.classList.remove("content_item_button_red");
                                                    el2.classList.add("content_item_button_green");
                                                    el2.value = "Добавить";

                                                    this.title.update({
                                                        add: "-"
                                                    });
                                                } else {
                                                    createMessage.call(this, "error", "Во время удаления элемента произошла ошибка!");
                                                }
                                            } else {
                                                if (updateOne.call(this, {
                                                    "_id": this.root.userData["_id"],
                                                    "password": localStorage.getItem("mlplist_password")
                                                }, {
                                                    "$push": data
                                                })) {
                                                    if (!(page in this.root.userData)) {
                                                        this.root.userData[page] = [];
                                                    }

                                                    this.root.userData[page].push(catData[item]["id"]);

                                                    el.classList.add("content_item_green");

                                                    el2.classList.remove("content_item_button_green");
                                                    el2.classList.add("content_item_button_red");
                                                    el2.value = "Удалить";

                                                    this.title.update({
                                                        add: "+"
                                                    });
                                                } else {
                                                    createMessage.call(this, "error", "Во время добавления элемента произошла ошибка!");
                                                }
                                            }
                                        });
                                    }));
                                }
                            }
                        }));
                    } catch (e) {
                        console.error(e);
                    }
                }

                if ((this.root.filter.available !== null) || (this.root.filter.sity.length > 0)) {
                    this.root.filterMenu.changeName("Фильтр: Найдено " + content.children.length);
                } else {
                    this.root.filterMenu.changeName("Фильтр");
                }

                setTimeout(() => {
                    this.root.loading.style.display = "none";
                }, 250);

                this.title.update({
                    add: add
                });
            }
        } catch (e) {
            console.error(e);
        }
    }
}
