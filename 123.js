// tiktok换区  

let code = 'KR';

/*
配置

#!name=TikTok
#!desc=去水印
#!system=ios-Loon

[Script]

http-request https:\/\/.+(tiktokv|byteoversea)\.com\/.+\=CN.+ script-path=https://anliya.xyz/ipa/123.js, requires-body=false, timeout=10, tag=tiktok

http-response https?:\/\/.*\.tiktokv\.com\/aweme\/v\d\/((follow\/)?feed|(((multi\/)?aweme\/))?(favorite|post|detail)) script-path=https://anliya.xyz/ipa/123.js, requires-body=true, timeout=10, tag=tiktok去水印
[MITM]
hostname = *.byteoversea.com,*.tiktokv.com


#!name=TikTok
#!desc=去水印
#!system=ios-Surge
[Script]

tiktok=type=http-request,pattern=^https:\/\/.+(tiktokv|byteoversea)\.com\/.+\=CN.+,requires-body=0,script-path=https://anliya.xyz/ipa/123.js

tiktok去水印=type=http-response,pattern=^https?:\/\/.*\.tiktokv\.com\/aweme\/v\d\/((follow\/)?feed|(((multi\/)?aweme\/))?(favorite|post|detail)),requires-body=1,script-path=https://anliya.xyz/ipa/123.js
[MITM]
hostname = %APPEND% *.byteoversea.com,*.tiktokv.com

*/

if ($request.url.indexOf("=CN") != -1) {

    unrestricted(code);

} else {

    watermark($response.body);

}

//  tiktok解锁 
function unrestricted(code) {

    if ($request.url.indexOf("get_domains/v5/") != -1) {

        $done({ response: { body: "" } });

    } else if ($request.url.indexOf("aweme/v2/feed/") != -1) {

        let url = $request.url.replace(/https:\/\/.+tiktokv.+aweme\/v2(\/feed\/.+)/, "https://api.tiktokv.com/aweme\/v1$1");

        url = url.replace(/\=CN/g, "=" + code);
        $done({
            response: { status: 307, headers: { Location: url } }
        });

    } else if ($request.url.indexOf("=CN") != -1) {

        let url = $request.url.replace(/\=CN/g, "=" + code);

        $done({ response: { status: 307, headers: { Location: url } } });

    } else {

        $done({})
    }
}

// 去水印

function watermark(body) {

    try {
        body.replace(/\"room_id\":(\d{2,})/g, '"room_id":"$1"');
        let obj = JSON.parse(body);
        if (obj.data) obj.data = Follow(obj.data);
        if (obj.aweme_list) obj.aweme_list = Feed(obj.aweme_list);
        if (obj.aweme_detail) obj.aweme_detail = Share(obj.aweme_detail);
        if (obj.aweme_details) obj.aweme_details = Feed(obj.aweme_details);
        $done({ body: JSON.stringify(obj) });
    } catch (err) {
        console.log("anliya666!!!!白嫖\n" + err);
        $done({});
    }
}

//watermark($response.body);

function Follow(data) {
    if (data && data.length > 0) {
        for (let i in data) {
            if (data[i].aweme.video) video_lists(data[i].aweme);
        }
    }
    return data;
}

function Feed(aweme_list) {
    if (aweme_list && aweme_list.length > 0) {
        for (let i in aweme_list) {
            if (aweme_list[i].is_ads == true) {
                aweme_list.splice(i, 1);
            } else if (aweme_list[i].video) {
                video_lists(aweme_list[i]);
            } else {
                if (!enabled_live) aweme_list.splice(i, 1);
            }
        }
    }
    return aweme_list;
}

function Share(aweme_detail) {

    if (aweme_detail.video) video_lists(aweme_detail);
    return aweme_detail;
}

function video_lists(lists) {
    lists.prevent_download = false;
    //  lists.music.prevent_download = false;
    // lists.music.is_commerce_music = false ;
    //
    // lists.music.is_original_sound = true;
    //
    lists.status.reviewed = 1;
    lists.video_control.allow_download = true;

    //lists.video_control.allow_music = true;

    lists.video_control.prevent_download_type = 0;
    delete lists.video.misc_download_addrs;
    lists.video.download_addr = lists.video.play_addr;
    lists.video.download_suffix_logo_addr = lists.video.play_addr;
    lists.aweme_acl.download_general.mute = false;
    if (lists.aweme_acl.download_general.extra) {
        delete lists.aweme_acl.download_general.extra;
        lists.aweme_acl.download_general.code = 0;
        lists.aweme_acl.download_general.show_type = 2;
        lists.aweme_acl.download_general.transcode = 3;
        lists.aweme_acl.download_mask_panel = lists.aweme_acl.download_general;
        lists.aweme_acl.share_general = lists.aweme_acl.download_general;
    }
    return lists;
}