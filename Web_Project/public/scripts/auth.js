$(function () {
    // Get the form.
    const form = $('#registerForm');
    $(form).submit(function (event) {
        // Stop the browser from submitting the form.
        event.preventDefault();
        const formData = $(form).serialize();
        const password = $(form).find(":input[name=password]")[0].value;
        const confirmPassword = $(form).find(":input[name=confirmPassword]")[0].value;
        if (password !== confirmPassword) {
            $("#register-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                + "the passwords doesn't match"
                + "</div>");
            return;
        }

        $.ajax({
            type: 'POST',
            url: $(form).attr('action'),
            data: formData
        }).done(function (response) {
            if (response.error) {
                $("#register-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                    + response.message
                    + "</div>");
            } else {
                $("#login-message").html("<div class=\"alert alert-success\" role=\"alert\">"
                    + "you are registered, you can now log in to the website"
                    + "</div>");
                $("#register-message").html("");
                $("#modalLogin").modal();
                $("#modalRegister").modal("hide");
            }
        }).fail(function (data) {
            $("#register-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                + data.responseJSON.message + data.responseJSON.param
                + "</div>");
        });
    });
});