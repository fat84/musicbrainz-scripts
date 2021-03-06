/* global $ requests helper */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Show alias count
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.2.11
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showcountalias.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showcountalias.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Show alias number on work/artist pages
// @compatible   firefox+greasemonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=174522
// @include      http*://*musicbrainz.org/work/*
// @exclude      http*://*musicbrainz.org/work/add*
// @exclude      http*://*musicbrainz.org/work/create*
// @include      http*://*musicbrainz.org/artist/*
// @exclude      http*://*musicbrainz.org/artist/add*
// @exclude      http*://*musicbrainz.org/artist/create*
// @grant        none
// @run-at       document-end
// ==/UserScript==

// adapted from jesus2099  mb. INLINE STUFF

// imported from mbz-loujine-common.js: requests, helper

function parseCount(resp, tab) {
    var cnt = resp.aliases.length,
        locales = [];
    if (cnt > 0) {
        tab.style.setProperty('background-color', '#6f9');
    }
    tab.textContent += ' (' + cnt + ')';
    resp.aliases.forEach(function (alias) {
        if (alias.locale) {
            locales.push(alias.locale);
        }
    });
    if (locales.length > 0) {
        tab.textContent += ' ' + locales.sort().join(',');
    }
}

(function showCountAliases() {
    var tab = $("a[href$='/aliases']")[0],
        entityType = document.URL.split('/')[3],
        url = helper.wsUrl(entityType, ['aliases']);
    requests.GET(url, function (resp) {
        parseCount(JSON.parse(resp), tab);
    });
})();

