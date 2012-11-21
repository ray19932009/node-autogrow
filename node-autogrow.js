/*global YUI, document */
/**
 * An utility that makes textarea expands in height to fit its contents.
 * It is an YUI implementation of the article, [Expanding Text Areas Made Elegant](http://www.alistapart.com/articles/expanding-text-areas-made-elegant/) by Neil Jenkins.
 *
 * * Usage:
 *
 *     <link rel="stylesheet" href="assets/node-autogrow.css">
 *     <script type="text/javascript" src="http://yui.yahooapis.com/3.7.3/build/yui/yui-min.js"></script>
 *     <script type="text/javascript" src="node-autogrow.js"></script>
 *     <script>
 *     YUI().use("node-pluginhost", "node-autogrow", function (Y) {
 *         Y.one("textarea").plug(Y.AutoGrow);
 *     });
 *     </script>
 *
 * * [See Example](http://josephj.com/lab/2012/node-autogrow/demo.html)
 *
 *  @module  node-autogrow
 *  @require node-base, classnamemanager, plugin, event-valuechange
 */
YUI.add("node-autogrow", function (Y) {

    var _getClassName,
        _createBox;

    /**
     * A shortcut of Y.ClassNameManager.getClassName method.
     *
     * @method _getClassName
     * @private
     * @return {String} The class name with prefix generated by classmanager.
     */
    _getClassName = function (text) {
        var className;
        if (!text) {
            className = Y.ClassNameManager.getClassName(AutoGrow.NAME);
        } else {
            className = Y.ClassNameManager.getClassName(AutoGrow.NAME, text);
        }
        return className;
    };

    /**
     * For implementing the trick in 'Expanding Text Areas Made Elegant',
     * a container outside textarea is necessary to be created.
     *
     * @method _createBox
     * @private
     * @param node {Y.Node} The YUI Node instance.
     */
    _createBox = function (node) {
        var el,    // The wrapper element.
            text,  // The textarea element.
            range;

        text = node._node;
        el = document.createElement("div");
        el.className = _getClassName();
        if (Y.UA.ie) { // TODO - Make sure if IE9+ supports DOM range.
            el.applyElement(text, "outside");
        } else {
            range = document.createRange();
            range.selectNode(text);
            range.surroundContents(el);
        }
        return Y.one(el);
    };

    /**
     * An utility that makes textarea expands in height to fit its contents.
     *
     * @class AutoGrow
     * @constructor
     * @param {Object} config attribute object
     */
    function AutoGrow(config) {
        this._node = config.host;
        AutoGrow.superclass.constructor.apply(this, arguments);
    }

    AutoGrow.MIRROR_HTML   = "<pre><span></span><br></pre>";
    AutoGrow.NAME  = "autogrow"; // To identify the class.
    AutoGrow.NS    = "AutoGrow"; // To identify the namespace.

    Y.extend(AutoGrow, Y.Plugin.Base, {
        /**
         * Execute automatically when user plugs.
         *
         * @method initializer
         * @public
         * @param config {Object} The config attribute object.
         */
        initializer: function (config) {
            var that = this,
                boundingBox, // The textarea container.
                html,        // The shortcut for AutoGrow.MIRROR_HTML constant.
                mirrorNode,
                textNode,
                width;

            html = AutoGrow.MIRROR_HTML;
            textNode = config.host;

            // Check if the config host is textarea.
            if (textNode.get("nodeName").toLowerCase() !== "textarea") {
                Y.log("The plugin host is not a textarea",
                      "error", "node-autogrow");
                return false;
            }

            // Create the container if necessary.
            boundingBox = Y.one(config.boundingBox) || null;
            if (!boundingBox || !boundingBox.one("textarea")) {
                boundingBox = _createBox(textNode);
                that._set("boundingBox", boundingBox);
            }

            if (config.width && parseInt(config.width, 10)) {
                width = parseInt(config.width, 10);
                boundingBox.setStyle("width", width + "px");
            }

            // Set the mirror <pre/> element.
            if (!boundingBox.one("pre span")) {
                boundingBox.insert(html, textNode);
            }
            mirrorNode = boundingBox.one("span");

            // Set class
            boundingBox.addClass(_getClassName());

            // Initalize the value.
            mirrorNode.setHTML(textNode.getHTML());

            // Bind event.
            textNode.on("valuechange", function (e) {
                mirrorNode.set("text", this.get("value"));
            })

        }
    });

    Y.AutoGrow = AutoGrow;

}, "0.0.1", {
    "requires": [
        "node-style",
        "event-valuechange",
        "classnamemanager",
        "plugin"
    ]
});
