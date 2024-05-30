let api = "https://mongo.jackiewaltryan.top/";

export function findOne(filter) {
    let data = null;

    try {
        let xhr = new XMLHttpRequest();

        xhr.open("POST", (api + "findOne"), false);

        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
                data = JSON.parse(xhr.responseText);
            } else {
                data = "";
            }
        });

        xhr.addEventListener("error", () => {
            data = null;
        });

        xhr.send(JSON.stringify({
            "filter": filter
        }));
    } catch {
        data = null;
    }

    return data;
}

export function insertOne(document) {
    let data = false;

    try {
        let xhr = new XMLHttpRequest();

        xhr.open("POST", (api + "insertOne"), false);

        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.addEventListener("load", () => {
            data = (xhr.status === 200);
        });

        xhr.addEventListener("error", () => {
            data = false;
        });

        xhr.send(JSON.stringify({
            "document": document
        }));
    } catch {
        data = false;
    }

    return data;
}

export function updateOne(filter, update) {
    let data = false;

    try {
        let xhr = new XMLHttpRequest();

        xhr.open("POST", (api + "updateOne"), false);

        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.addEventListener("load", () => {
            data = (xhr.status === 200);
        });

        xhr.addEventListener("error", () => {
            data = false;
        });

        xhr.send(JSON.stringify({
            "filter": filter,
            "update": update
        }));
    } catch {
        data = false;
    }

    return data;
}
