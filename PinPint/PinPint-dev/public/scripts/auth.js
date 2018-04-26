$(function () {
    // Get the registerForm.
    const registerForm = $('#registerForm');
    $(registerForm).submit(function (event) {
        // Stop the browser from submitting the registerForm.
        event.preventDefault();
        const formData = $(this).serialize();
        const password = $(this).find(":input[name=password]")[0].value;
        const confirmPassword = $(this).find(":input[name=confirmPassword]")[0].value;
        if (password !== confirmPassword) {
            $("#register-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                + "the passwords doesn't match"
                + "</div>");
            return;
        }

        $.ajax({
            type: 'POST',
            url: $(registerForm).attr('action'),
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
            let param = data.responseJSON.param;
            if (param === undefined) param = "";
            $("#register-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                + data.responseJSON.message + param
                + "</div>");
        });
    });

    const loginForm = $('.loginForm');
    $(loginForm).submit(function (event) {
        // Stop the browser from submitting the loginForm.
        event.preventDefault();
        const formData = $(this).serialize();

        $.ajax({
            type: 'POST',
            url: $(loginForm).attr('action'),
            data: formData
        }).done(function (response) {
            if (response.error) {
                $(".login-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                    + response.message
                    + "</div>");
            } else {
                window.location.reload();
            }
        }).fail(function (data) {
            let param = data.responseJSON.param;
            if (param === undefined) param = "";
            $(".login-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                + data.responseJSON.message + param
                + "</div>");
        });
    });

    const deleteAccountForm = $('#deleteAccountForm');
    $(deleteAccountForm).submit(function (event) {
        // Stop the browser from submitting the loginForm.
        event.preventDefault();
        const formData = $(this).serialize();

        $.ajax({
            type: 'POST',
            url: $(deleteAccountForm).attr('action'),
            data: formData
        }).done(function (response) {
            if (response.error) {
                $("#deleteAccount-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                    + response.message
                    + "</div>");
            } else {
                window.location = "/";
            }
        }).fail(function (data) {
            let param = data.responseJSON.param;
            if (param === undefined) param = "";
            $("#deleteAccount-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                + data.responseJSON.message + param
                + "</div>");
        });
    });

    const changePasswordForm = $('#changePasswordForm');
    $(changePasswordForm).submit(function (event) {
        // Stop the browser from submitting the loginForm.
        event.preventDefault();
        const formData = $(this).serialize();
        const currentPassword = $(changePasswordForm).find(":input[name=oldPassword]")[0].value;
        const newPassword = $(changePasswordForm).find(":input[name=newPassword]")[0].value;
        const confirmNewPassword = $(changePasswordForm).find(":input[name=confirmNewPassword]")[0].value;
        if (currentPassword === newPassword) {
            $("#changePasswordForm-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                + "You new password need to different from the old"
                + "</div>");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            $("#changePasswordForm-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                + "the passwords doesn't match"
                + "</div>");
            return;
        }

        $.ajax({
            type: 'POST',
            url: $(changePasswordForm).attr('action'),
            data: formData
        }).done(function (response) {
            if (response.error) {
                $("#changePasswordForm-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                    + response.message
                    + "</div>");
            } else {
                $("#changePasswordForm-message").html("<div class=\"alert alert-success\" role=\"alert\">"
                    + response.message
                    + "</div>");
            }
        }).fail(function (data) {
            let param = data.responseJSON.param;
            if (param === undefined) param = "";
            $("#changePasswordForm-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                + data.responseJSON.message + param
                + "</div>");
        });
    });
});