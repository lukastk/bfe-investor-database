$.datetimepicker.setDateFormatter({
    parseDate: function (date, format) {
        var d = moment(date, format);
        return d.isValid() ? d.toDate() : false;
    },
    formatDate: function (date, format) {
        return moment(date).format(format);
    },
});

$('.datetime').datetimepicker({
    format:'DD-MM-YYYY hh:mm A',
    formatTime:'hh:mm A',
    formatDate:'DD-MM-YYYY',
    useCurrent: false,
});

// Initialise Pusher
const pusher = new Pusher('3bec6d2ac2247ecbd32a', {
    cluster: 'eu',
    encrypted: true
});

var channel = pusher.subscribe('table');

channel.bind('new-record', (data) => {
   $('#investors').append(`
        <tr id="${data.data.id}">
            <th scope="row"> ${data.data.organisation} </th>
            <td> ${data.data.region} </td>
            <td> ${data.data.website} </td>
            <td> ${data.data.description} </td>
            <td> ${data.data.additional_info} </td>
        </tr>
   `)
});

channel.bind('update-record', (data) => {
    $(`#${data.data.id}`).html(`
        <th scope="row"> ${data.data.organisation} </th>
        <td> ${data.data.region} </td>
        <td> ${data.data.website} </td>
        <td> ${data.data.description} </td>
        <td> ${data.data.additional_info} </td>
    `)

 });
