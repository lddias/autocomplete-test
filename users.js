/* requirements:
      - remove irrelevant results
      - sort results such that whole name matches return first
      - email match takes precedent over partial name match

  notes / todo:
      - ignoring case
      - autocomplete options show name and email. should it only show best match?
      - reuse indexof results from filter step, during sort
*/

$('#userSearch').autocomplete({
    lookup: function (query, done) {
        searchUsers(query, done);
    },
    onSelect: function (suggestion) {
        alert('You selected: ' + suggestion.value + ', ' + suggestion.data);
    }
});

function searchUsers(query, callback) {
  $.get( {
    url: "http://127.0.0.1:8080/?search=" + query,
    dataType: "json"
  }, function( data ) {
    filter = query.toUpperCase();

    function user_sort(a, b) {
      // whole name match is highest priority
      aWholeNameMatch = a.name.split(' ').map(function (name) {
        if (filter.indexOf(name.toUpperCase()) > -1) {
          return true;
        }
        return false;
      }).some(x => x);
      bWholeNameMatch = b.name.split(' ').map(function (name) {
        if (filter.indexOf(name.toUpperCase()) > -1) {
          return true;
        }
        return false;
      }).some(x => x);

      if (aWholeNameMatch && bWholeNameMatch) {
        return a.name.localeCompare(b.name);
      } else if (aWholeNameMatch) {
        // a wins since it has a whole name match and b doesn't
        return -1;
      } else if (bWholeNameMatch) {
        // b wins since it has a whole name match and a doesn't
        return 1;
      }

      // email match takes precedent over partial name match
      if (a.email.toUpperCase().indexOf(filter) > -1) {
        a = a.email
      } else {
        a = a.name
      }
      if (b.email.toUpperCase().indexOf(filter) > -1) {
        b = b.email
      } else {
        b = b.name
      }

      // regular string compare between emails/names
      return a.localeCompare(b);
    }

    // compose result:
    // remove irrelevant results
    ret = data.filter(user => (user.email.toUpperCase().indexOf(filter) > -1) || (user.name.toUpperCase().indexOf(filter) > -1))
              // sort results
              .sort(user_sort).map(user => ({value: user.name + ': ' + user.email, data: user}));
    callback({suggestions: ret});
  });
}
