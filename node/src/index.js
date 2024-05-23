let {init} = require("./mlplist");

class MLPlist {
    constructor() {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => {
                init.call(this);
            });
        } else {
            init.call(this);
        }
    }
}

module.exports = MLPlist;
