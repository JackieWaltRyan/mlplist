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
        this.title = document.getElementsByTagName("title")[0];
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

        if (this.add && this.all) {
            text += (" (Имеется: " + this.add + ", Не имеется: " + (this.all - this.add) + ")");
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
