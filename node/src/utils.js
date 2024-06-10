export function createElement(tag, params = {}, actions = () => {
}) {
    let el = document.createElement(tag);

    for (let name in params) {
        try {
            el.setAttribute(name, params[name]);
        } catch (e) {
            console.log(e);
        }
    }

    actions(el);

    return el;
}

export function createMessage(type, text) {
    let message = createElement("div", {
        class: ("messages_message messages_message_" + type)
    }, (el) => {
        el.innerText = text;
    });

    document.getElementById("messages").appendChild(message);

    setTimeout(() => {
        message.remove();
    }, 3000);
}

export function zoomIn(event) {
    let zoom = document.getElementById("zoom");

    let scrollWidth = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth, document.body.scrollWidth, document.documentElement.scrollWidth, document.body.scrollWidth, document.documentElement.scrollWidth);

    zoom.style.display = "block";
    zoom.style.top = ((event.y - (event["srcElement"]["naturalHeight"] / 2)).toString() + "px");
    zoom.style.width = (event["srcElement"]["naturalWidth"].toString() + "px");
    zoom.style.height = (event["srcElement"]["naturalHeight"].toString() + "px");
    zoom.style.background = ("url(\"" + event["srcElement"]["currentSrc"] + "\")");

    if ((event.x + 50 + event["srcElement"]["naturalWidth"]) <= scrollWidth) {
        zoom.style.left = ((event.x + 50).toString() + "px");
    } else {
        if ((event.x - 50 - event["srcElement"]["naturalWidth"]) >= 0) {
            zoom.style.left = ((event.x - 50 - event["srcElement"]["naturalWidth"]).toString() + "px");
        } else {
            zoom.style.left = (0 + "px");
        }
    }
}

export function zoomOut() {
    let zoom = document.getElementById("zoom");

    zoom.style.background = "none";
    zoom.style.display = "none";
}

export class updateTitle {
    constructor() {
        this.title = document.getElementById("title");
        this.ogTitle = document.getElementById("og_title");

        this.description = document.getElementById("description");
        this.ogDescription = document.getElementById("og_description");

        this.headerTitle = document.getElementById("header_title");

        this.category = null;
        this.user = null;

        this.add = null;
        this.all = null;
    }

    update(data) {
        this.headerTitle.style.display = "block";

        if ("category" in data) {
            this.category = data["category"];
        }

        if ("user" in data) {
            this.user = data["user"];
        }

        let text = "Список";

        if (this.category) {
            text += (" \"" + this.category + "\"");
        }

        if (this.user) {
            text += (" пользователя \"" + this.user + "\"");
        }

        this.title.innerText = text;
        this.ogTitle.content = text;

        if ("all" in data) {
            this.all = parseInt(data["all"]);
        }

        if ("add" in data) {
            if (data["add"] === "+") {
                this.add += 1;
            } else if (data["add"] === "-") {
                this.add -= 1;
            } else {
                this.add = parseInt(data["add"]);
            }
        }

        if ((this.add !== null) && (this.all !== null)) {
            let data = ("Имеется: " + this.add + ", Не имеется: " + (this.all - this.add));

            text += (" (" + data + ")");

            this.description.content = data;
            this.ogDescription.content = data;
        }

        this.headerTitle.innerText = text;
    }
}

export function titleCase(sentence) {
    sentence.split(" ").forEach((word) => {
        sentence = sentence.replace(word, () => {
            return (word.charAt(0).toUpperCase() + word.substring(1).toLowerCase());
        });
    });

    return sentence;
}

export function scrollMenu() {
    let scrollRoot = null;
    let scrollIcon = null;

    let scrollOld = 0;

    document.querySelector("body").appendChild(createElement("div", {
        class: "scroll",
    }, (el) => {
        scrollRoot = el;

        el.appendChild(createElement("img", {
            class: "scroll_icon",
            src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGZpbGw9JyNmZmYnIHZpZXdCb3g9JzAgMCA4IDgnPjxwYXRoIGQ9J001LjI1IDBsLTQgNCA0IDQgMS41LTEuNS0yLjUtMi41IDIuNS0yLjUtMS41LTEuNXonLz48L3N2Zz4="
        }, (el2) => {
            scrollIcon = el2;
        }));

        el.addEventListener("click", () => {
            if (scrollY > 0) {
                scrollOld = scrollY;

                scrollTo(scrollX, 0);
            } else {
                scrollTo(scrollX, scrollOld);

                scrollOld = 0;
            }
        });
    }));

    if (scrollY > 0) {
        scrollRoot.style.display = "flex";

        scrollIcon.style.transform = "rotate(90deg)";
    }

    window.addEventListener("scroll", () => {
        if (scrollY > 0) {
            scrollRoot.style.display = "flex";

            scrollIcon.style.transform = "rotate(90deg)";
        } else if ((scrollY === 0) && (scrollOld > 0)) {
            scrollRoot.style.display = "flex";

            scrollIcon.style.transform = "rotate(270deg)";
        } else {
            scrollRoot.style.display = "none";
        }
    });
}
