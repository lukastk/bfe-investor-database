var sweep = function(search_words, col="") {
  $("#investors tbody tr").each(function() {
    var hasKey = false;

    cols = $(this).children();
    if (col !== "") {
      cols = $(this).find("." + col + "-data")
    }

    cols.each(function() {
      rowwords = $(this).text().replace(/\n/ig, '').split(/[ ,]+/);
      for (var i = 0; i < search_words.length; i++) {
        if (rowwords.indexOf(search_words[i]) >= 0) {
          hasKey = true;
        }
      }
    });

    if (hasKey) {
      $(this).css("display","");
    } else {
      $(this).css("display","none");
    }
  });
}

var search = function() {
  $("#investors tbody tr").each(function() {
    $(this).css("display","");
  });

  if ($("#keywords-search").val() !== "") {
    keywords = $("#keywords-search").val().split(/[ ,]+/);
    sweep(keywords);
  }

  var col = "organisation";
  if ($("#"+col+"-search").val() !== "") {
    col_search = $("#"+col+"-search").val().split(/[ ,]+/);
    sweep(col_search, col);
  }

  var col = "region";
  if ($("#"+col+"-search").val() !== "") {
    col_search = $("#"+col+"-search").val().split(/[ ,]+/);
    sweep(col_search, col);
  }
}
