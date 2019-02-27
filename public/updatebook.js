function updateBook(id){
    $.ajax({
        url: '/book/' + id,
        type: 'PUT',
        data: $('#update-book').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};