let api = "https://westeurope.azure.data.mongodb-api.com/app/data-peqidvk/endpoint/data/v1/action/";

export function updateToken() {
    try {
        let xhr = new XMLHttpRequest();

        xhr.open("POST", "https://westeurope.azure.services.cloud.mongodb.com/api/client/v2.0/app/data-peqidvk/auth/providers/local-userpass/login", false);

        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
                this.token = JSON.parse(xhr.responseText)["access_token"];

                setTimeout(() => {
                    updateToken.call(this);
                }, 300000);
            }
        });

        xhr.send(JSON.stringify({
            "username": "ponylist",
            "password": "gI2Ob2fj7N1pgKGm"
        }));
    } catch (e) {
        console.error(e);
    }
}

export function findOne(filter) {
    let data = "Ошибка загрузки";

    try {
        let xhr = new XMLHttpRequest();

        xhr.open("POST", (api + "findOne"), false);

        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", ("Bearer " + this.token));

        xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
                data = JSON.parse(xhr.responseText)["document"];
            }
        });

        xhr.send(JSON.stringify({
            "dataSource": "DB",
            "database": "DB",
            "collection": "ponylist",

            "filter": filter
        }));
    } catch (e) {
        console.error(e);
    }

    return data;
}

export function insertOne(document) {
    let data;

    try {
        let xhr = new XMLHttpRequest();

        xhr.open("POST", (api + "insertOne"), false);

        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", ("Bearer " + this.token));

        xhr.addEventListener("load", () => {
            if (xhr.status === 201) {
                data = true;
            }
        });

        xhr.send(JSON.stringify({
            "dataSource": "DB",
            "database": "DB",
            "collection": "ponylist",

            "document": document
        }));
    } catch (e) {
        console.error(e);
    }

    return data;
}

export function updateOne(filter, update) {
    let data;

    try {
        let xhr = new XMLHttpRequest();

        xhr.open("POST", (api + "updateOne"), false);

        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", ("Bearer " + this.token));

        xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
                data = true;
            }
        });

        xhr.send(JSON.stringify({
            "dataSource": "DB",
            "database": "DB",
            "collection": "ponylist",

            "filter": filter,
            "update": update
        }));
    } catch (e) {
        console.error(e);
    }

    return data;
}
