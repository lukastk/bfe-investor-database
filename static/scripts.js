var sweep = function(search_words, col="") {
  search_words = search_words.map(function(e) { return e.toLowerCase(); });

  put_rows_last = []

  $("#investors tbody tr").each(function() {
    var hasKey = true;

    var row_id = parseInt($(this).attr("id"));

    for (var i = 0; i < all_columns.length; i++) {
      col_name = all_columns[i];

      if (col !== "" && col_name !== (col+"-data")) {
        continue;
      }

      if (col !== "" && row_data[row_id][col_name].replace(/ /g,'') === "") {
        hasKey = true;
        put_rows_last.push($(this))
      } else if (col !== "" && row_data[row_id][col_name].toLowerCase().replace(/ /g,'') === "all") {
        hasKey = true;
      } else {
        rowwords = row_data[row_id][col_name].replace(/\n/ig, '').split(/[ ,]+/);
        rowwords = rowwords.map(function (e) { return e.toLowerCase(); });

        for (var j = 0; j < search_words.length; j++) {
          if (!(rowwords.indexOf(search_words[j]) >= 0)) {
            hasKey = false;
          }
        }
      }
    }

    if (hasKey) {
      $(this).css("display","");
    } else {
      $(this).css("display","none");
    }
  });

  for (var i = 0; i < put_rows_last.length; i++) {
    var row = put_rows_last[i];
    row.remove();
    $("#investors tr:last").after(row);
  }
}

var currency_to_USD = {
    USD : 1,
    GBP : 1.31,
    EUR : 1.14,
};

var fund_sweep = function(currency, fmin, fmax) {
  fmin = fmin * currency_to_USD[currency.toUpperCase()];
  fmax = fmax * currency_to_USD[currency.toUpperCase()];

  put_rows_last = [];

  $("#investors tbody tr").each(function() {
    try {
      var hasKey = false;

      cols = $(this).find(".fund-data")

      row_currency = cols.attr("data-fundc");
      row_min = parseInt(cols.attr("data-fundmin"));
      row_max = parseInt(cols.attr("data-fundmax"));


      if (isNaN(row_min) || isNaN(row_max)) {
        hasKey = true;
        put_rows_last.push($(this))
      } else {
        row_min = row_min * currency_to_USD[row_currency.toUpperCase()];
        row_max = row_max * currency_to_USD[row_currency.toUpperCase()];

        if ( row_max >= fmin && row_min <= fmax) {
          hasKey = true;
        }

        if (hasKey) {
          $(this).css("display","");
        } else {
          $(this).css("display","none");
        }
      }
    } catch (err) {
      console.log(err)
    }
  });

  for (var i = 0; i < put_rows_last.length; i++) {
    var row = put_rows_last[i];
    row.remove();
    $("#investors tr:last").after(row);
  }
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
    //col_search = $("#"+col+"-search").val().split(/[ ,]+/);
    col_search = $("#"+col+"-search").val().split(";");
    col_search = col_search.map( function(e) { return e.trim(); } );
    add = [];
    for (var i = 0; i < col_search.length; i++) {
      if (col_search[i] in sectors_children) {
        add = add.concat(sectors_children[col_search[i]]);
      }
    }
    sweep(col_search, col);
  }

  var col = "type";
  if ($("#"+col+"-search").val() !== "") {
    col_search = $("#"+col+"-search").val().split(/[ ,]+/);
    sweep(col_search, col);
  }

  var col = "country";
  if ($("#"+col+"-search").val() !== "") {
    /*col_search = $("#"+col+"-search").val().match(/\\?.|^$/g).reduce((p, c) => {
            if(c === '"'){
                p.quote ^= 1;
            }else if(!p.quote && c === ' '){
                p.a.push('');
            }else{
                p.a[p.a.length-1] += c.replace(/\\(.)/,"$1");
            }
            return  p;
        }, {a: ['']}).a;*/
    col_search = $("#"+col+"-search").val().split(";");
    col_search = col_search.map( function(e) { return e.trim(); } );
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
    if ($("#fund-size_min-search").val() !== "" && $("#fund-size_max-search").val() !== "") {
      currency = $("#fund-currency-search").val();
      if (currency === "") { currency = "USD"; }
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

var clean_columns = ["sector-data", "type-data", "country-data"];
var clean_data_text = function(row_id) {
  for (var i = 0; i < clean_columns.length; i++) {
      col = clean_columns[i];
      txt = $("#" + row_id + " " + "." + col).text();

      txt = txt.trim();
      txt = txt.replace("\n", " ");
  }
}

var is_shortened = {};
var row_data = {};
var all_columns = ["organisation-data", "description-data", "sector-data", "type-data", "country-data", "fund-data", "competition-available-data"]
var shorten_columns =             ["description-data", "sector-data", "type-data", "country-data"];
var shorten_columns_text_length = [100,                 10,           10,           10];

var store_row_data = function(row_id) {
  row_data[row_id] = {};
  for (var i = 0; i < all_columns.length; i++) {
      col = all_columns[i];
      row_data[row_id][col] = $("#" + row_id + " " + "." + col).text();
  }
}

var set_shortened_text = function(row_id, shorten) {
  is_shortened[row_id] = shorten;
  for (var i = 0; i < shorten_columns.length; i++) {
      col = shorten_columns[i];
      txt = row_data[row_id][col];
      max_text_length = shorten_columns_text_length[i];

      if (shorten) {
        if (txt.length > max_text_length) {
          $("#" + row_id + " " + "." + col).text( txt.slice(0, max_text_length) + "..." )
        }
      } else {
        $("#" + row_id + " " + "." + col).text( txt )
      }
  }

  if (shorten) {
    $("#"+row_id + " .see-more-button").text("See more");
  } else {
    $("#"+row_id + " .see-more-button").text("See less");
  }
}
