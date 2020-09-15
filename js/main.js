jQuery(document).ready(function() {
    $('div.json[data-json]').each(function(index, element) {
        var json = $(element).attr('data-json').replace(/[\u201C\u201D]/g, '"');
        jsonView.format(json, element); 
    });
});
