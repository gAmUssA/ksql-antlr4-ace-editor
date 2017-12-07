ace.define('ace/mode/my-mode',
           ["require",
            "exports",
            "module",
            "ace/lib/oop",
            "ace/mode/text",
            "ace/mode/text_highlight_rules",
            "ace/worker/worker_client"],

           function (require, exports, module) {
             var oop = require("ace/lib/oop");
             var TextMode = require("ace/mode/text").Mode;
             var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

             var SqlHighlightRules = function () {

               var keywords = (
                 "select|insert|update|delete|from|where|and|or|group|by|order|limit|offset|having|as|case|"
                 +
                 "list|show|print|"
                 +
                 "when|else|end|type|left|right|join|on|outer|desc|asc|union|create|table|stream|primary|key|if|"
                 +
                 "foreign|not|references|default|null|inner|cross|natural|database|drop|grant"
               );

               var builtinConstants = (
                 "true|false"
               );

               var builtinFunctions = (
                 "avg|count|first|last|max|min|sum|ucase|lcase|mid|len|round|rank|now|format|"
                 +
                 "coalesce|ifnull|isnull|nvl"
               );

               var dataTypes = (
                 "int|numeric|decimal|date|varchar|char|bigint|float|double|bit|binary|text|set|timestamp|"
                 +
                 "money|real|number|integer"
               );

               var keywordMapper = this.createKeywordMapper({
                                                              "support.function": builtinFunctions,
                                                              "keyword": keywords,
                                                              "constant.language": builtinConstants,
                                                              "storage.type": dataTypes
                                                            }, "identifier", true);

               this.$rules = {
                 "start": [{
                   token: "comment",
                   regex: "--.*$"
                 }, {
                   token: "comment",
                   start: "/\\*",
                   end: "\\*/"
                 }, {
                   token: "string",           // " string
                   regex: '".*?"'
                 }, {
                   token: "string",           // ' string
                   regex: "'.*?'"
                 }, {
                   token: "string",           // ` string (apache drill)
                   regex: "`.*?`"
                 }, {
                   token: "constant.numeric", // float
                   regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
                 }, {
                   token: keywordMapper,
                   regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
                 }, {
                   token: "keyword.operator",
                   regex: "\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|="
                 }, {
                   token: "paren.lparen",
                   regex: "[\\(]"
                 }, {
                   token: "paren.rparen",
                   regex: "[\\)]"
                 }, {
                   token: "text",
                   regex: "\\s+"
                 }]
               };
               this.normalizeRules();
             };
             oop.inherits(SqlHighlightRules, TextHighlightRules);

             var MyMode = function () {
               this.HighlightRules = SqlHighlightRules;
             };
             oop.inherits(MyMode, TextMode);

             (function () {

               this.$id = "ace/mode/my-mode";

               var WorkerClient = require("ace/worker/worker_client").WorkerClient;
               this.createWorker = function (session) {
                 this.$worker =
                   new WorkerClient(["ace"], "ace/worker/my-worker", "MyWorker",
                                    "my-worker.js");
                 this.$worker.attachToDocument(session.getDocument());

                 this.$worker.on("errors", function (e) {
                   session.setAnnotations(e.data);
                 });

                 this.$worker.on("annotate", function (e) {
                   session.setAnnotations(e.data);
                 });

                 this.$worker.on("terminate", function () {
                   session.clearAnnotations();
                 });

                 return this.$worker;

               };

             }).call(MyMode.prototype);

             exports.Mode = MyMode;
           });
