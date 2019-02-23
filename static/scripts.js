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

var fund_sweep = function(currency, fmin, fmax) {
  console.log(123)
  $("#investors tbody tr").each(function() {
    try {
      var hasKey = false;

      cols = $(this).find(".fund-data")

      row_currency = cols.attr("data-fundc");
      row_min = parseInt(cols.attr("data-fundmin"));
      row_max = parseInt(cols.attr("data-fundmax"));

      if (currency === row_currency) {
        if ( row_max >= fmin && row_min <= fmax) {
          hasKey = true;
        }
      }

      if (hasKey) {
        $(this).css("display","");
      } else {
        $(this).css("display","none");
      }
    } catch (err) {
      console.log(err)
    }
  });
}

var search = function() {
  $("#investors tbody tr").each(function() {
    $(this).css("display","");
  });

  if ($("#keywords-search").val() !== "") {
    col_search = $("#keywords-search").val().split(/[ ,]+/);
    sweep(col_search);
  }

  var col = "organisation";
  if ($("#"+col+"-search").val() !== "") {
    col_search = $("#"+col+"-search").val().split(/[ ,]+/);
    sweep(col_search, col);
  }

  var col = "sector";
  if ($("#"+col+"-search").val() !== "") {
    col_search = $("#"+col+"-search").val().split(/[ ,]+/);
    sweep(col_search, col);
  }

  var col = "type";
  if ($("#"+col+"-search").val() !== "") {
    col_search = $("#"+col+"-search").val().split(/[ ,]+/);
    sweep(col_search, col);
  }

  var col = "country";
  if ($("#"+col+"-search").val() !== "") {
    col_search = $("#"+col+"-search").val().match(/\\?.|^$/g).reduce((p, c) => {
            if(c === '"'){
                p.quote ^= 1;
            }else if(!p.quote && c === ' '){
                p.a.push('');
            }else{
                p.a[p.a.length-1] += c.replace(/\\(.)/,"$1");
            }
            return  p;
        }, {a: ['']}).a;

    add = [];
    for (var i = 0; i < col_search.length; i++) {
      if (col_search[i] in countries_children) {
        add = add.concat(countries_children[col_search[i]]);
      }
    }

    col_search = col_search.concat(add);
    sweep(col_search, col);
  }

  try {
    if ($("#fund-currency-search").val() !== "" &&  $("#fund-size_min-search").val() !== "" && $("#fund-size_max-search").val() !== "") {
      currency = $("#fund-currency-search").val();
      fmin = parseInt($("#fund-size_min-search").val());
      fmax = parseInt($("#fund-size_max-search").val());
      fund_sweep(currency, fmin, fmax);
    }
  } catch (err) {
      console.log(err);
  }
}

var delete_entry = function(id) {
  $.ajax({
      url: '/delete/' + id,
      type: 'POST',
      success: function(response) {
          console.log(response);
      },
      error: function(error) {
          console.log(error);
      }
  })
}

function numToLabel (labelValue) {

    // Nine Zeroes for Billions
    return Math.abs(Number(labelValue)) >= 1.0e+9

    ? Math.abs(Number(labelValue)) / 1.0e+9 + "B"
    // Six Zeroes for Millions
    : Math.abs(Number(labelValue)) >= 1.0e+6

    ? Math.abs(Number(labelValue)) / 1.0e+6 + "M"
    // Three Zeroes for Thousands
    : Math.abs(Number(labelValue)) >= 1.0e+3

    ? Math.abs(Number(labelValue)) / 1.0e+3 + "K"

    : Math.abs(Number(labelValue));

}
