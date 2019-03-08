function updateUser(id){
    $.ajax({
        url: '/users/' + id,
        type: 'PUT',
        data: $('#update-user').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};