/* global $ MB requests server relEditor */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Batch-set guessed works
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.5.12
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setguessedworks.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setguessedworks.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Set best-guess related works
// @compatible   firefox+greasemonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=195378
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

var MBID_REGEX = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/;

function setWork(recording, work) {
    var url = '/ws/js/entity/' + work.gid + '?inc=rels';
    requests.GET(url, function (resp) {
        var vm = MB.releaseRelationshipEditor;
        var target = JSON.parse(resp);
        var dialog = MB.relationshipEditor.UI.AddDialog({
            source: recording,
            target: target,
            viewModel: vm
        });
        target.relationships.forEach(function (rel) {
            // apparently necessary to fill MB.entityCache with rels
            MB.getRelationship(rel, target);
        });
        dialog.accept();
    });
}

function guessWork() {
    var recordings = MB.relationshipEditor.UI.checkedRecordings(),
        idx = 0;
    recordings.forEach(function (recording) {
        var url = '/ws/js/work/?q=' +
                  encodeURIComponent($('#prefix')[0].value) + ' ' +
                  encodeURIComponent(recording.name) +
                  '&artist=' + encodeURIComponent(recording.artist) +
                  '&fmt=json&limit=1';
        if (!recording.performances().length) {
            idx += 1;
            setTimeout(function () {
                requests.GET(url, function (resp) {
                    setWork(recording, JSON.parse(resp)[0]);
                });
            }, idx * server.timeout);
        }
    });
}

function autoComplete() {
    var $input = $('input#mainWork');
    var match = $input.val().match(MBID_REGEX);
    if (match) {
        var mbid = match[0];
        requests.GET('/ws/2/work/' + mbid + '?fmt=json', function (data) {
            data = JSON.parse(data);
            $input.data('mbid', mbid);
            $input.val(data.title || data.name);
            $input.css('background', '#bbffbb');
        });
    } else {
        $input.css('background', '#ffaaaa');
    }
}

function guessSubWorks(workMbid) {
    if (workMbid.split('/').length > 1) {
        workMbid = workMbid.split('/')[4];
    }
    var recordings = MB.relationshipEditor.UI.checkedRecordings(),
        idx = 0;
    var mainWorkUrl = '/ws/js/entity/' + workMbid + '?inc=rels';
    requests.GET(mainWorkUrl, function (resp) {
        var subWorks = helper.sortSubworks(JSON.parse(resp));
        recordings.forEach(function (recording, recordingIdx) {
            if (recordingIdx >= subWorks.length) {
                return;
            }
            if (!recording.performances().length) {
                idx += 1;
                setTimeout(function () {
                    setWork(recording, subWorks[recordingIdx]);
                }, idx * server.timeout);
            }
        });
    });
}

(function displayToolbar(relEditor) {
    $('div.tabs').after(
        relEditor.container().append(
            $('<h3>Search for works</h3>')
        ).append(
            $('<p>You can add an optional prefix (e.g. the misssing parent work name) to help guessing the right work</p>')
        ).append(
            $('<span>Optional prefix:&nbsp;</span>')
        ).append(
            $('<input>', {
                'id': 'prefix',
                'type': 'text',
                'value': ''
            })
        ).append(
            $('<input>', {
                'id': 'searchwork',
                'type': 'button',
                'value': 'Guess works'
            })
        ).append(
            $('<br />')
        ).append(
            $('<h3>Link to parts of a main Work</h3>')
        ).append(
            $('<p>Fill the main work mbid to link selected recordings to (ordered) parts of the work</p>')
        ).append(
            $('<span>Main work name:&nbsp;</span>')
        ).append(
            $('<input>', {
                'id': 'mainWork',
                'type': 'text',
                'placeholder': 'main work mbid'
            })
        ).append(
            $('<input>', {
                'id': 'searchsubworks',
                'type': 'button',
                'value': 'Guess subworks'
            })

        )
    );
})(relEditor);

$(document).ready(function() {
    var appliedNote = false;
    $('#searchwork').click(function() {
        guessWork();
        if (!appliedNote) {
            relEditor.editNote(GM_info.script, 'Set guessed works');
            appliedNote = true;
        }
    });
    $('input#mainWork').on('input', autoComplete);
    $('input#searchsubworks').click(function() {
        guessSubWorks($('input#mainWork').data('mbid'));
        if (!appliedNote) {
            relEditor.editNote(GM_info.script, 'Set guessed subworks');
            appliedNote = true;
        }
    });
    return false;
});

