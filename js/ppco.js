$(document).ready(function () {
    var get_new_form_groups = function(id, index, embedString, isPlaylist) {
        var form_groups = '<input type="hidden" class="xpan_form_element" name="session_id[]" value="'+id+'">';
        form_groups += '<input type="hidden" class=xpan_form_element" name="is_playlist[]" value="' + (isPlaylist ? 1 : 0) + '">';

        form_groups += '<div class="form-group xpan_form_element" id="il_prop_cont_embed_'+index+'">';
        form_groups += '<label for="embed_'+index+'" class="col-sm-3 control-label">Video</label>';
        form_groups += '<div class="col-sm-9">';
        form_groups += '<div class="form_inline">';
        form_groups += embedString;
        form_groups += '</div>';
        form_groups += '</div>';
        form_groups += '</div>';

        form_groups += '<div class="form-group xpan_form_element" id="il_prop_cont_max_width_'+index+'">';
        form_groups += '<label for="max_width_'+index+'" class="col-sm-3 control-label">Maximale Breite in %<span class="asterisk">*</span></label>';
        form_groups += '<div class="col-sm-9">';
        form_groups += '<div class="form_inline">';
        form_groups += '<input style="text-align:right;width:auto;" class="form-control" type="text" size="40" id="max_width_'+index+'" maxlength="200" name="max_width[]" required="required" value="50">';
        form_groups += '<div class="help-block"></div>';
        form_groups += '</div>';
        form_groups += '</div>';
        form_groups += '</div>';


        return form_groups;
    };

    var iframe = $('#xpan_iframe'),
        iframe_src = iframe.attr('src'),
        servername = iframe_src.substr(0, iframe_src.indexOf('/Panopto/Pages/Sessions/EmbeddedUpload.aspx')),
        insert_button = $('#xpan_insert'),
        eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent',
        eventEnter = window[eventMethod],
        messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message',
        choose_videos_link = $('#il_prop_cont_xpan_choose_videos_link');

    //Hide insert button initially, until a video is selected
    insert_button.prop('disabled', true);

    // Listen to message from child iframe
    eventEnter(messageEvent, function (e) {
        console.log(e);
        var message = JSON.parse(e.data),
            thumbnailChunk = '',
            idChunk = '',
            embedString = '',
            ids = message.ids,
            names = message.names,
            VIDEO_EMBED_ID = 0,
            PLAYLIST_EMBED_ID = 1;

        //If a video is chosen, show the "Insert" button
        if (message.cmd === 'ready') {
            insert_button.prop('disabled', false);
        }

        //If no video is chosen, hide the "Insert" button
        if (message.cmd === 'notReady') {
            insert_button.prop('disabled', true);
        }

        //Called when "Insert" is clicked. Creates HTML for embedding each selected video into the editor
        if (message.cmd === 'deliveryList') {
            // remove existing form elements
            $('.xpan_form_element').remove();

            ids = message.ids;
            for (var i = (ids.length - 1); i >= 0; --i) {
                let isPlaylist = false;
                if (message.playableObjectTypes && (parseInt(message.playableObjectTypes[i]) === PLAYLIST_EMBED_ID)){
                    idChunk = "?pid=" + ids[i];
                    isPlaylist = true;
                } else {
                    idChunk = "?id=" + ids[i];
                }

                embedString = "<iframe class='xpan_form_element' id='iframe_"+i+"' src='" + servername + "/Panopto/Pages/Embed.aspx" +
                    idChunk + "&v=1' width='450' height='256' frameborder='0' allowfullscreen></iframe>";

                // add new form elements (iframe + max_width)
                $(get_new_form_groups(ids[i], i, embedString, isPlaylist)).insertAfter(choose_videos_link);
            }
            $('#xpan_modal').modal('hide')
        }
    }, false);

    insert_button.click(function () {
        var win = document.getElementById('xpan_iframe').contentWindow,
            message = {
                cmd: 'createEmbeddedFrame'
            };
        win.postMessage(JSON.stringify(message), servername);
    });

    // $('#cancel').click(function () {
    //     tinyMCEPopup.close();
    // });
});


