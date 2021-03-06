/* global $ MB server relEditor */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Batch-set recording-work attributes
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.5.12
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setattributes.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setattributes.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Set attributes (live, partial) on selected recordings
// @compatible   firefox+greasemonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=195378
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

function setAttributes(attrId, toggle) {
    var recordings = MB.relationshipEditor.UI.checkedRecordings();
    recordings.forEach(function(recording) {
        recording.performances().forEach(function(relation) {
            var attrs = relation.attributes(),
                attr = attrs.filter(function(el) {
                    // attrId already in relation attributes
                    return el.type.id === attrId;
                });
            if (!attr.length) {
                attrs.push({type: MB.attrInfoByID[attrId]});
            } else if (toggle) {
                attrs.splice(attrs.indexOf(attr), 1);
            }
            relation.setAttributes(attrs);
        });
    });
}

(function displayToolbar(relEditor) {
    $('div.tabs').after(
        relEditor.container().append(
            $('<h3>', {'text': 'Recording-Work relation attributes'})
        ).append(
            $('<input>', {
                'id': 'setlive',
                'type': 'button',
                'value': 'Set live'
            })
        ).append(
            $('<input>', {
                'id': 'setpartial',
                'type': 'button',
                'value': 'Set partial'
            })
        ).append(
            $('<input>', {
                'id': 'togglelive',
                'type': 'button',
                'value': 'Toggle live'
            })
        ).append(
            $('<input>', {
                'id': 'togglepartial',
                'type': 'button',
                'value': 'Toggle partial'
            })
        )
    );
})(relEditor);

$(document).ready(function() {
    $('#setlive').click(function() {
        setAttributes(server.attr.live, false);
        relEditor.editNote(GM_info.script);
    });
    $('#setpartial').click(function() {
        setAttributes(server.attr.partial, false);
        relEditor.editNote(GM_info.script);
    });
    $('#togglelive').click(function() {
        setAttributes(server.attr.live, true);
        relEditor.editNote(GM_info.script);
    });
    $('#togglepartial').click(function() {
        setAttributes(server.attr.partial, true);
        relEditor.editNote(GM_info.script);
    });
    return false;
});
