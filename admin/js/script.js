// Initially hide content with CSS instead of jQuery
$(document).ready(function () {
    $('body').css('visibility', 'hidden');
});




$(document).ready(function () {
    // Check admin authentication before showing admin page
    $.ajax({
        url: 'php/check_admin.php',
        method: 'GET',
        dataType: 'json', // Explicitly specify JSON datatype
        success: function (response) {
            try {
                console.log('Response:', response); // Debug log the response
                
                if (response && response.status === 'success' && response.authenticated === true) {
                    // Show all content
                    $('body').css('visibility', 'visible');

                    // Force layout recalculation and resize
                    if ($('.ui.sidebar')[0]) {
                        $('.ui.sidebar')[0].offsetHeight;
                    }
                    if ($('.main-content')[0]) {
                        $('.main-content')[0].offsetHeight;
                    }
                    $(window).trigger('resize');
                } else {
                    console.log('Authentication failed:', response); // Debug log
                    // Session expired or not admin, redirect to login
                    window.location.href = 'login.html?message=' + encodeURIComponent(response?.message || 'please_login');
                }
            } catch (e) {
                console.error('Parse error:', e, 'Raw response:', response); // More detailed error logging
                window.location.href = 'login.html?message=invalid_response';
            }
        },
        error: function (xhr, status, error) {
            console.error('Request failed:', {xhr: xhr, status: status, error: error}); // Detailed error logging
            // Handle network errors or server issues
            window.location.href = 'login.html?message=server_error';
        },
        complete: function() {
            // Update last activity timestamp
            if (typeof lastActivityTime !== 'undefined') {
                lastActivityTime = new Date().getTime();
            }
        }
    });

    // Handle logout click
    $('.bottom-menu .item').click(function (e) {
        e.preventDefault();
        $.ajax({
            url: 'php/logout.php',
            method: 'POST',
            success: function () {
                window.location.href = 'login.html';
            }
        });
    });


    // Add gallery images preview
    $('input[name="gallery_images[]"]').on('change', function (e) {
        var files = e.target.files;
        $('#galleryPreview').empty();

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = function (e) {
                var imgUrl = e.target.result;
                var imgContainer = $('<div>').css({
                    'position': 'relative',
                    'display': 'inline-block',
                    'margin': '5px'
                });
                var img = $('<img>').attr('src', imgUrl).css({
                    'width': '100px',
                    'height': '100px',
                    'object-fit': 'cover'
                });
                var deleteBtn = $('<span>').text('×').css({
                    'position': 'absolute',
                    'top': '5px',
                    'right': '5px',
                    'cursor': 'pointer',
                    'background-color': 'red',
                    'border-radius': '50%',
                    'width': '20px',
                    'height': '20px',
                    'text-align': 'center',
                    'line-height': '18px',
                    'color': 'white',
                    'font-size': '16px',
                    'font-weight': 'bold'
                }).on('click', function () {
                    $(this).parent().remove();
                });
                imgContainer.append(img).append(deleteBtn);
                $('#galleryPreview').append(imgContainer);
            }
            reader.readAsDataURL(file);
        }
    });

    $('.ui.dropdown').dropdown().find('.dropdown.icon').removeClass('dropdown icon').addClass('chevron down icon');

    let isDropdownOpen = false;
    $('.ui.dropdown').on({
        'click .chevron.down.icon': function () {
            if (!isDropdownOpen) {
                isDropdownOpen = true;
                $(this).dropdown('toggle');
            }
        },
        'hide': function () {
            isDropdownOpen = false;
        },
        'hover': function () {
            $(this).toggleClass('hover');
        },
        'click': function () {
            $(this).removeClass('upward');
        }
    });

    $('#EditProductCategory, #EditProductTag').dropdown({
        placeholder: function () {
            return $(this).attr('id').includes('Category') ? 'Categories' : 'Tags';
        }
    });

    $('#addProductBtn, #cancelBtn').on('click', function () {
        $('#addProductPopup').modal($(this).is('#addProductBtn') ? 'show' : 'hide');
    });

    $('#AddProductTag, #Tag').dropdown();

    $('#AddProductTag').dropdown({
        allowReselection: true,
        clearable: true,
        forceSelection: false
    }).on('click', function () {
        $(this).dropdown('show');
    });

    $('#AddProductCategory').on('click', function () {
        $(this).dropdown('show');
    });

    $('#deleteProductBtn').on('click', function () {
        if (confirm('Are you sure you want to delete all products?')) {
            $.ajax({
                url: 'php/del_all_product.php',
                type: 'POST',
                data: { delete_all_products: true },
                success: function (data) {
                    toastr.success('All products have been deleted.');
                    $('#productTableBody').empty();
                    $('#pagination_product').hide();
                    $('.pagination_product').hide();
                },
                error: function (xhr, status, error) {
                    console.error("Error deleting products:", error);
                    toastr.error('An error occurred while deleting the products. Please try again.');
                }
            });
        }
    });

    $('#create_date').on('change', function () {
        var today = new Date().toISOString().split('T')[0];
        if ($(this).val() > today) {
            $(this).val(today);
            toastr.warning('Cannot choose future date.');
        }
        checkDateValidity();
    });

    $('#update_date').on('change', function () {
        var today = new Date().toISOString().split('T')[0];
        if ($(this).val() > today) {
            $(this).val(today);
            toastr.warning('Cannot choose future date.');
        }
        checkDateValidity();
    });

    function checkDateValidity() {
        var createDate = new Date($('#create_date').val());
        var updateDate = new Date($('#update_date').val());
        if (createDate > updateDate) {
            $('#update_date').val($('#create_date').val());
            toastr.warning('Cannot choose earlier date.');
        }
    }

    $('#filterBtn').on('click', function () {
        var filter = {
            Date: $('#Date').val(),
            Order: $('#Order').val(),
            Category: $('#Category').val(),
            Tag: $('#Tag').val(),
            create_date: $('#create_date').val(),
            update_date: $('#update_date').val(),
            price_from: $('#price_from').val(),
            price_to: $('#price_to').val()
        };

        var price_from = parseFloat($('#price_from').val());
        var price_to = parseFloat($('#price_to').val());

        if (price_from > price_to) {
            toastr.error('Price from must be less than price to');
            return;
        }
        $.ajax({
            url: 'php/filter.php',
            type: 'POST',
            data: { filter: filter },
            dataType: 'json',
            success: function (response) {
                var tableBody = $('#productTableBody');
                tableBody.empty();
                if (response.status === 'success') {
                    var products = response.products;
                    var productsPerPage = 5;
                    var totalPages = Math.ceil(products.length / productsPerPage);
                    var currentPage = 1;

                    function displayProducts(page) {
                        currentPage = page;
                        var start = (page - 1) * productsPerPage;
                        var end = start + productsPerPage;
                        var pageProducts = products.slice(start, end);

                        tableBody.empty();
                        $.each(pageProducts, function (i, product) {
                            var row = $('<tr>');
                            var id = product.id;
                            row.append($('<td>').text(id).css('display', 'none'));
                            var date = new Date(product.created_date);
                            var formattedDate = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/');
                            row.append($('<td>').text(formattedDate));
                            row.append($('<td>').text(product.title));
                            row.append($('<td>').text(product.sku));

                            var price = parseFloat(product.price);
                            row.append($('<td>').text("$" + parseFloat(price).toFixed(2)));

                            if (product.featured_image) {
                                var featuredImage = $('<img>').attr('src', product.featured_image.replace('../', '')).css({
                                    'width': '30px',
                                    'height': '30px',
                                    'object-fit': 'cover',
                                });
                                row.append($('<td>').html(featuredImage));
                            } else {
                                row.append($('<td>').text('No img'));
                            }

                            var galleryImages = product.gallery ? product.gallery.split(',') : [];
                            var firstGalleryImage = galleryImages[0];

                            if (firstGalleryImage) {
                                var galleryImage = $('<img>').attr('src', firstGalleryImage.replace('../', '')).css({
                                    'width': '30px',
                                    'height': '30px',
                                    'object-fit': 'cover'
                                });
                                row.append($('<td>').html(galleryImage));
                            } else {
                                row.append($('<td>').text('No img'));
                            }

                            row.append($('<td>').text(product.categories));
                            row.append($('<td>').text(product.tags));
                            row.append($('<td>').html('<i class="edit icon editIcon"></i><i class="trash icon trashIcon"></i>').css('white-space', 'nowrap'));
                            tableBody.append(row);
                        });

                        updatePagination(currentPage, totalPages);
                    }

                    function updatePagination(currentPage, totalPages) {
                        var paginationContainer = $('.pagination_product .pagination');
                        paginationContainer.empty();

                        $('.total-pages').text(totalPages);
                        $('.current-page').text(currentPage);

                        paginationContainer.append($('<a>').addClass('item').html('<i class="arrow left icon"></i>').on('click', function () {
                            if (currentPage > 1) {
                                displayProducts(currentPage - 1);
                            }
                        }));

                        var startPage = Math.max(1, currentPage - 2);
                        var endPage = Math.min(totalPages, startPage + 4);

                        if (startPage > 1) {
                            paginationContainer.append($('<a>').addClass('item').text('1').on('click', function () {
                                displayProducts(1);
                            }));
                            if (startPage > 2) {
                                paginationContainer.append($('<span>').addClass('item disabled').text('...'));
                            }
                        }

                        for (var i = startPage; i <= endPage; i++) {
                            var pageLink = $('<a>').addClass('item').text(i);
                            if (i === currentPage) {
                                pageLink.addClass('active');
                            }
                            pageLink.on('click', function () {
                                displayProducts(parseInt($(this).text()));
                            });
                            paginationContainer.append(pageLink);
                        }

                        if (endPage < totalPages) {
                            if (endPage < totalPages - 1) {
                                paginationContainer.append($('<span>').addClass('item disabled').text('...'));
                            }
                            paginationContainer.append($('<a>').addClass('item').text(totalPages).on('click', function () {
                                displayProducts(totalPages);
                            }));
                        }

                        paginationContainer.append($('<a>').addClass('item').html('<i class="arrow right icon"></i>').on('click', function () {
                            if (currentPage < totalPages) {
                                displayProducts(currentPage + 1);
                            }
                        }));

                        $('.pagination_product').show();
                    }

                    displayProducts(currentPage);
                } else {
                    tableBody.append($('<tr>').append($('<td colspan="9">').text(response.message)));
                    $('.pagination_product').hide();
                }
            },
            error: function (xhr, status, error) {
                console.error("Error filtering products:", error);
                var tableBody = $('#productTableBody');
                tableBody.empty();
                var errorMessage = 'An error occurred while filtering the products. Please try again.';
                tableBody.append($('<tr>').append($('<td colspan="9">').text(errorMessage)));
                $('.pagination_product').hide();
            }
        });
    });

    // add property
    $('#addPropertyBtn').on('click', function () {
        $('#addPropertyPopup').modal('show');
    });

    $('#cancelPropertyBtn').on('click', function () {
        $('#addPropertyPopup').modal('hide');
    });

    $('#submitPropertyBtn').on('click', function () {
        var property_type = $('#propertyType').val();
        var property_name = $('#propertyName').val();

        if (property_type === '') {
            toastr.error('Choose property type');
            return;
        }
        if (property_name === '') {
            toastr.error('Property name cannot be empty');
            return;
        }

        $.ajax({
            url: 'php/add_category_tag.php',
            type: 'POST',
            data: { property_type: property_type, property_name: property_name },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    toastr.success(response.message);
                    $('#addPropertyPopup').modal('hide');
                    if (property_type === 'category') {
                        $.ajax({
                            url: 'php/category_view.php',
                            type: 'GET',
                            dataType: 'json',
                            success: function (data) {
                                var selects = ['#Category', '#EditProductCategory', '#AddProductCategory'];
                                selects.forEach(function (selectId) {
                                    var select = $(selectId);
                                    select.empty();
                                    $.each(data.categories, function (i, category) {
                                        select.append($('<option></option>').val(category.id).text(category.category_name));
                                    });
                                    select.dropdown('refresh');
                                });
                            },
                            error: function (xhr, status, error) {
                                console.error("Error fetching categories:", error);
                            }
                        });
                    } else if (property_type === 'tag') {
                        $.ajax({
                            url: 'php/tag_view.php',
                            type: 'GET',
                            dataType: 'json',
                            success: function (data) {
                                var selects = ['#Tag', '#EditProductTag', '#AddProductTag'];
                                selects.forEach(function (selectId) {
                                    var select = $(selectId);
                                    select.empty();
                                    $.each(data.tags, function (i, tag) {
                                        select.append($('<option></option>').val(tag.id).text(tag.tag_name));
                                    });
                                    select.dropdown('refresh');
                                });
                            },
                            error: function (xhr, status, error) {
                                console.error("Error fetching tags:", error);
                            }
                        });
                    }
                    $('#propertyType').val('');
                    $('#propertyName').val('');
                } else {
                    toastr.error('Failed to add property: ' + response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error("Error adding property:", error);
                toastr.error('An error occurred while adding the property. Please try again.');
            }
        });
    });

    // search product
    let searchTimeout;
    let products = [];

    $('#searchProduct').on('keyup', function () {
        clearTimeout(searchTimeout);
        var product_name = $(this).val();

        searchTimeout = setTimeout(function () {
            if (product_name.length >= 1) {
                $.ajax({
                    url: 'php/product_find.php',
                    type: 'GET',
                    data: { product_name: product_name },
                    dataType: 'json',
                    success: function (response) {

                        if (response.status === 'success') {
                            products = response.products;
                            displayProductsInTable(products, 1);
                            updatePagination(1, Math.ceil(products.length / 5));
                        } else {
                            $('#productTableBody').html('<tr><td colspan="7">No products found</td></tr>');
                            $('.pagination_product').hide();
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error("Error searching products:", error);
                        $('#productTableBody').html('<tr><td colspan="7">Error searching products</td></tr>');
                        $('.pagination_product').hide();
                    }
                });
            } else {
                loadProducts(1);
                $('.pagination_product').show();
            }
        }, 300);
    });

    function displayProductsInTable(products, page = 1) {
        let tableBody = $('#productTableBody');
        tableBody.empty();
        let productsPerPage = 5;
        let start = (page - 1) * productsPerPage;
        let end = start + productsPerPage;
        let pageProducts = products.slice(start, end);

        pageProducts.forEach(function (product) {
            var row = $('<tr>');
            var date = new Date(product.created_date);
            var formattedDate = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/');
            row.append($('<td>').text(product.id).css('display', 'none'));
            row.append($('<td>').text(formattedDate));
            row.append($('<td>').text(product.title));
            row.append($('<td>').text(product.sku));
            row.append($('<td>').text("$" + parseFloat(product.price).toFixed(2)));

            if (product.featured_image) {
                var featuredImage = $('<img>').attr('src', product.featured_image.replace('../', '')).css({
                    'width': '30px',
                    'height': '30px',
                    'object-fit': 'cover',
                });
                row.append($('<td>').html(featuredImage));
            } else {
                row.append($('<td>').text('No img'));
            }

            var galleryImages = product.gallery ? product.gallery.replace('../', '').split(',') : [];
            var firstGalleryImage = galleryImages[0];

            if (firstGalleryImage) {
                var galleryImage = $('<img>').attr('src', firstGalleryImage).css({
                    'width': '30px',
                    'height': '30px',
                    'object-fit': 'cover'
                });
                row.append($('<td>').html(galleryImage));
            } else {
                row.append($('<td>').text('No img'));
            }

            row.append($('<td>').text(product.categories));
            row.append($('<td>').text(product.tags));
            row.append($('<td>').html('<i class="edit icon editIcon"></i><i class="trash icon trashIcon"></i>').css('white-space', 'nowrap'));
            tableBody.append(row);
        });

        updatePagination(page, Math.ceil(products.length / productsPerPage));
    }

    function updatePagination(currentPage, totalPages) {
        var paginationContainer = $('.pagination_product .pagination');
        paginationContainer.empty();

        $('.total-pages').text(totalPages);
        $('.current-page').text(currentPage);

        paginationContainer.append($('<a>').addClass('item').html('<i class="arrow left icon"></i>').on('click', function () {
            if (currentPage > 1) {
                displayProductsInTable(products, currentPage - 1);
            }
        }));

        var maxVisiblePages = 6;
        var halfVisible = Math.floor(maxVisiblePages / 2);
        var startPage = Math.max(1, currentPage - halfVisible);
        var endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            paginationContainer.append($('<a>').addClass('item').text('1').on('click', function () {
                displayProductsInTable(products, 1);
            }));
            if (startPage > 2) {
                paginationContainer.append($('<span>').addClass('item disabled').text('...'));
            }
        }

        for (var i = startPage; i <= endPage; i++) {
            var pageLink = $('<a>').addClass('item').text(i);
            if (i === currentPage) {
                pageLink.addClass('active');
            }
            pageLink.on('click', function () {
                displayProductsInTable(products, parseInt($(this).text()));
            });
            paginationContainer.append(pageLink);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationContainer.append($('<span>').addClass('item disabled').text('...'));
            }
            paginationContainer.append($('<a>').addClass('item').text(totalPages).on('click', function () {
                displayProductsInTable(products, totalPages);
            }));
        }

        paginationContainer.append($('<a>').addClass('item').html('<i class="arrow right icon"></i>').on('click', function () {
            if (currentPage < totalPages) {
                displayProductsInTable(products, currentPage + 1);
            }
        }));

        $('.pagination_product').show();
    }

    // Category
    $.ajax({
        url: 'php/category_view.php',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            var selects = ['#AddProductCategory', '#Category', '#EditProductCategory'];
            selects.forEach(function (selectId) {
                var select = $(selectId);
                select.empty();
                $.each(data.categories, function (i, category) {
                    select.append($('<option></option>').val(category.id).text(category.category_name));
                });
                select.dropdown('refresh');
            });
        },
        error: function (xhr, status, error) {
            console.error("Error fetching categories:", error);
        }
    });


    // tag
    $.ajax({
        url: 'php/tag_view.php',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            var selects = ['#Tag', '#AddProductTag', '#EditProductTag'];
            selects.forEach(function (selectId) {
                var select = $(selectId);
                select.empty();
                $.each(data.tags, function (i, tag) {
                    select.append($('<option></option>').val(tag.id).text(tag.tag_name));
                });
                select.dropdown('refresh');
            });
        },
        error: function (xhr, status, error) {
            console.error("Error fetching tags:", error);
        }
    });

    // add product 
    $('#AddProductForm').on('submit', function (e) {
        e.preventDefault();

        var priceValue = $('#product_price').val();
        var price = parseFloat(priceValue);
        if (isNaN(price) || price < 0) {
            toastr.error('Price must be a number greater than 0');
            return;
        }

        var formData = new FormData(this);

        var selectedCategories = $('#AddProductCategory').val();
        var selectedTags = $('#AddProductTag').val();
        formData.append('Category', JSON.stringify(selectedCategories));
        formData.append('Tag', JSON.stringify(selectedTags));

        var galleryFiles = $('#galleryPreview img').map(function () {
            return $(this).attr('src');
        }).get();
        formData.append('gallery_images', JSON.stringify(galleryFiles));


        $.ajax({
            url: 'php/product_add.php',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    toastr.success(response.message);
                    $('#addProductPopup').modal('hide');
                    $('#AddProductForm')[0].reset();
                    $('#AddProductCategory').dropdown('clear');
                    $('#AddProductTag').dropdown('clear');
                    $('#galleryPreview').empty();

                    reloadCurrentPage();
                } else {
                    console.error("Error adding product:", response.message);
                    toastr.error('Failed to add product: ' + response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error("Error adding product:", error);
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    toastr.error('An error occurred: ' + xhr.responseJSON.message);
                } else {
                    toastr.error('An error occurred while adding the product. Please try again.');
                }
            }
        });
    });

    $('#cancelEditBtn').on('click', function () {
        $('#editProductPopup').modal('hide');
    });
    $('#productTableBody').on('click', '.editIcon', function () {
        $('#editProductPopup').modal('show');
    });

    // Product view
    let currentPage = 1;
    // const limit = 5;
    loadProducts(currentPage);

    // edit add information product
    $('#productTableBody').on('click', '.editIcon', function () {
        var sku = $(this).closest('tr').find('td:nth-child(3)').text();

        $('#EditProductForm')[0].reset();
        $('#EditProductCategory').dropdown('clear');
        $('#EditProductTag').dropdown('clear');

        // Hide image previews by default
        $('#EditProductFeaturedImagePreview').hide();
        $('#EditProductGalleryPreview').empty();

        $.ajax({
            url: 'php/product_edit.php',
            type: 'GET',
            dataType: 'json',
            data: { id: $(this).closest('tr').find('td:first-child').text() },
            success: function (data) {
                if (data.status === 'success') {

                    var product = data.product;

                    $('#EditProductID').val(product.id);
                    $('#EditProductName').val(product.title);
                    $('#EditProductSKU').val(product.sku);
                    $('#EditProductPrice').val(product.price);
                    $('#EditProductSalePrice').val(product.sale_price);

                    if (product.featured_image) {
                        $('#EditProductFeaturedImagePreview')
                            .attr('src', product.featured_image.replace('../', ''))
                            .show();
                    }

                    $('#EditProductFeaturedImage').on('change', function (e) {
                        var file = e.target.files[0];
                        if (file) {
                            var reader = new FileReader();
                            reader.onload = function (e) {
                                $('#EditProductFeaturedImagePreview')
                                    .attr('src', e.target.result)
                                    .show();
                            };
                            reader.readAsDataURL(file);
                        }
                    });

                    var galleryImages = [];

                    function createGalleryImage(imagePath, index) {
                        var imgContainer = $('<div>', {
                            class: 'gallery-image-container',
                            style: 'display: inline-block; position: relative; margin: 5px;'
                        });

                        var imgElement = $('<img>', {
                            src: imagePath.replace('../', '').trim(),
                            style: 'max-width: 100px; max-height: 100px;'
                        });

                        var deleteButton = $('<span>', {
                            text: '×',
                            style: 'position: absolute; top: -5px; right: -5px; cursor: pointer; background-color: red; color: white; padding: 0 5px; border-radius: 50%; font-size: 14px; line-height: 18px; z-index: 10;'
                        }).on('click', function () {
                            galleryImages.splice(index, 1);
                            displayGalleryImages();
                        });

                        imgElement.css({
                            'transition': 'transform 0.3s ease-in-out',
                            'z-index': '1'
                        });

                        imgContainer.hover(
                            function () {
                                imgElement.css({
                                    'transform': 'scale(1.1)',
                                    'z-index': '5'
                                });
                            },
                            function () {
                                imgElement.css({
                                    'transform': 'scale(1)',
                                    'z-index': '1'
                                });
                            }
                        );

                        imgContainer.append(imgElement).append(deleteButton);
                        return imgContainer;
                    }

                    function displayGalleryImages() {
                        $('#EditProductGalleryPreview').empty();
                        galleryImages.forEach(function (imagePath, index) {
                            $('#EditProductGalleryPreview').append(createGalleryImage(imagePath, index));
                        });
                    }

                    if (product.gallery && product.gallery.length > 0) {
                        galleryImages = product.gallery.filter(function (imagePath) {
                            return imagePath && imagePath.trim() !== '';
                        });
                        displayGalleryImages();
                    }

                    $('#EditProductGalleryImages').off('change').on('change', function (e) {
                        var files = e.target.files;
                        Array.from(files).forEach(function (file) {
                            if (file) {
                                var reader = new FileReader();
                                reader.onload = function (e) {
                                    galleryImages.push(e.target.result);
                                    displayGalleryImages();
                                };
                                reader.readAsDataURL(file);
                            }
                        });
                    });

                    $('#EditProductCategory').dropdown('refresh');
                    $('#EditProductTag').dropdown('refresh');
                    $('#EditProductCategory').dropdown('clear');
                    $('#EditProductTag').dropdown('clear');

                    if (product.category_ids && product.category_ids.length > 0) {
                        $('#EditProductCategory').dropdown('set selected', product.category_ids);
                    }
                    if (product.tags && product.tags.length > 0) {
                        $('#EditProductTag').dropdown('set selected', product.tags);
                    }

                    $('#EditProductCategory').dropdown('refresh');
                    $('#EditProductTag').dropdown('refresh');


                    nameProduct = product.title;
                    skuProduct = product.sku;
                    priceProduct = product.price;
                    salePriceProduct = product.sale_price;
                    featuredImageProduct = product.featured_image;
                    galleryProduct = product.gallery;
                    categoryProduct = product.category_ids;
                    tagsProduct = product.tag_ids;

                } else {
                    toastr.error('Product not found.');
                }
            },
            error: function (xhr, status, error) {
                console.error("Error fetching product details:", error);
            }
        });
    });

    // Edit product
    $('#editProductPopup').on('click', '#submitEditBtn', function (e) {
        e.preventDefault();

        var salePrice = parseFloat($('#EditProductSalePrice').val());
        var price = parseFloat($('#EditProductPrice').val());
        if (isNaN(price)) {
            toastr.error('Please enter valid numbers for price and sale price.');
            return;
        }
        if (salePrice > price || salePrice < 0 || price < 0) {
            toastr.error('Sale price must be less than price and both must be non-negative.');
            return;
        }

        function isDifferent(value1, value2) {
            if (value1 === '' || value1 === null) value1 = undefined;
            if (value2 === '' || value2 === null) value2 = undefined;
            return String(value1).trim() !== String(value2).trim();
        }

        function areArraysDifferent(arr1, arr2) {
            if (!arr1 || !arr2) return true;
            if (arr1.length !== arr2.length) return true;
            return JSON.stringify(arr1.sort()) !== JSON.stringify(arr2.sort());
        }

        function getUniqueGalleryImages() {
            var uniqueImages = [];
            var seenUrls = new Set();
            var seenBase64 = new Set();

            $('#EditProductGalleryPreview .gallery-image-container:not(.removed) img').each(function () {
                var src = $(this).attr('src');
                if (src.startsWith('data:image')) {
                    var base64Data = src.split(',')[1];
                    if (!seenBase64.has(base64Data)) {
                        seenBase64.add(base64Data);
                        uniqueImages.push(src);
                    }
                } else {
                    if (!seenUrls.has(src)) {
                        seenUrls.add(src);
                        uniqueImages.push(src);
                    }
                }
            });

            return uniqueImages;
        }

        var formData = new FormData($('#EditProductForm')[0]);

        var selectedCategories = $('#EditProductCategory').dropdown('get value') || [];
        var selectedTags = $('#EditProductTag').dropdown('get value') || [];

        formData.append('Category', JSON.stringify(selectedCategories));
        formData.append('Tag', JSON.stringify(selectedTags));

        var uniqueGalleryImages = getUniqueGalleryImages();

        uniqueGalleryImages.forEach(function (image, index) {
            if (image.startsWith('data:image')) {
                formData.append('new_gallery_images[]', image);
            } else {
                formData.append('existing_gallery_images[]', image.replace('../img/uploads/', ''));
            }
        });

        var removedImages = $('#EditProductGalleryPreview .gallery-image-container.removed img').map(function () {
            return $(this).attr('src');
        }).get();

        var existingFeaturedImage = $('#EditProductFeaturedImagePreview').attr('src');
        if (existingFeaturedImage) {
            formData.append('existing_featured_image', existingFeaturedImage.replace('../img/uploads/', ''));
        }

        function arraysEqual(arr1, arr2) {
            if (arr1.length !== arr2.length) return false;
            for (var i = 0; i < arr1.length; i++) {
                if (arr1[i] !== arr2[i]) return false;
            }
            return true;
        }

        var hasChanges = isDifferent($('#EditProductName').val(), nameProduct) ||
            isDifferent($('#EditProductSKU').val(), skuProduct) ||
            isDifferent($('#EditProductPrice').val(), priceProduct) ||
            isDifferent($('#EditProductSalePrice').val(), salePriceProduct) ||
            $('#EditProductFeaturedImage').get(0).files.length > 0 ||
            areArraysDifferent(selectedCategories, categoryProduct) ||
            areArraysDifferent(selectedTags, tagsProduct) ||
            !arraysEqual(uniqueGalleryImages, galleryProduct) ||
            removedImages.length > 0;

        if (hasChanges) {
            formData.append('removed_images', JSON.stringify(removedImages.map(img => img.replace('../img/uploads/', ''))));

            $.ajax({
                url: 'php/product_edit.php',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'json',
                success: function (response) {
                    if (response.status === 'success') {
                        toastr.success(response.message);
                        $('#editProductPopup').modal('hide');
                        reloadCurrentPage();

                        nameProduct = $('#EditProductName').val();
                        skuProduct = $('#EditProductSKU').val();
                        priceProduct = $('#EditProductPrice').val();
                        salePriceProduct = $('#EditProductSalePrice').val();
                        categoryProduct = selectedCategories;
                        tagsProduct = selectedTags;
                        if ($('#EditProductFeaturedImage').get(0).files.length > 0) {
                            featuredImageProduct = $('#EditProductFeaturedImagePreview').attr('src');
                        } else {
                            featuredImageProduct = existingFeaturedImage;
                        }
                        galleryProduct = uniqueGalleryImages;
                    } else {
                        toastr.error('Failed to update product: ' + response.message);
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Error updating product:", error);
                    toastr.error('An error occurred while updating the product. Please try again.');
                }
            });
        } else {
            toastr.info('No changes detected. Update cancelled.');
            $('#editProductPopup').modal('hide');
        }
    });

    // delete product
    $('#productTableBody').on('click', '.trashIcon', function () {
        var id = $(this).closest('tr').find('td:first-child').text();
        var currentRowCount = $('#productTableBody tr').length;
        var currentPage = parseInt($('.pagination.menu .item.active').text()) || 1;
        var totalPages = $('.pagination.menu .item').length;
        if (confirm('Confirm delete this product?')) {
            $.ajax({
                url: 'php/product_delete.php',
                type: 'POST',
                data: { id: id },
                success: function (data) {
                    var response = JSON.parse(data);
                    if (response.status === 'success') {
                        toastr.success(response.message);
                        if (currentRowCount === 1 && currentPage > 1) {
                            loadProducts(currentPage - 1);
                        }
                        else if (currentRowCount <= 5 && currentPage === 1) {
                            $('#productTableBody tr').filter(function () {
                                return $(this).find('td:first-child').text() === id;
                            }).remove();
                        }
                        else {
                            reloadCurrentPage();
                        }

                    } else {
                        toastr.error(response.message);
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Error deleting product:", error);
                    toastr.error('An error occurred while deleting the product. Please try again.');
                }
            });
        }
    });

    // sync villa theme
    $('#syncVillaThemeBtn').on('click', function () {
        $(this).text('Syncing...').prop('disabled', true);
        $('#addProductBtn, #addPropertyBtn, #filterBtn, #searchProduct').prop('disabled', true);
        $('#productTableBody').find('.editIcon, .trashIcon').prop('disabled', true);
        $('#deleteProductBtn').addClass('disabled').css('pointer-events', 'none');
        $('#searchProduct').val('').prop('disabled', true);

        function syncBatch(url) {
            $.ajax({
                url: 'php/proxy.php',
                type: 'GET',
                data: { target: url },
                success: function (response) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(response, 'text/html');
                    var productLinks = [];

                    doc.querySelectorAll('h2.woocommerce-loop-product__title a').forEach(function (link) {
                        productLinks.push(link.href);
                    });

                    if (productLinks.length === 0) {
                        finishSync();
                        return;
                    }

                    function syncLinks(links) {
                        var batch = links.slice(0, 5);
                        $.ajax({
                            url: 'php/sync_villa.php',
                            type: 'POST',
                            data: JSON.stringify({ urls: batch }),
                            contentType: 'application/json',
                            dataType: 'json',
                            success: function (response) {
                                if (response.status === 'success') {
                                    if (links.length > 5) {
                                        syncLinks(links.slice(5));
                                    } else {
                                        var nextPageLink = doc.querySelector('.pagination.loop-pagination .next.page-numbers');
                                        if (nextPageLink) {
                                            syncBatch(nextPageLink.href);
                                        } else {
                                            finishSync();
                                        }
                                    }
                                } else {
                                    toastr.error('Error syncing batch: ' + response.message);
                                }
                            },
                            error: function (xhr, status, error) {
                                console.error('Error syncing VillaTheme:', error);
                                console.error('Response text:', xhr.responseText);
                                toastr.error('An error occurred while syncing VillaTheme. Please try again.');
                            }
                        });
                    }

                    syncLinks(productLinks);
                },
                error: function (xhr, status, error) {
                    console.error('Error fetching page:', error);
                    console.error('Response text:', xhr.responseText);
                    toastr.error('An error. Please try again.');
                }
            });
        }

        function finishSync() {
            $('#syncVillaThemeBtn').text('Sync VillaTheme').prop('disabled', false);
            $('#addProductBtn, #addPropertyBtn, #filterBtn, #searchProduct').prop('disabled', false);
            $('#productTableBody').find('.editIcon, .trashIcon').prop('disabled', false);
            $('#deleteProductBtn').removeClass('disabled').css('pointer-events', 'auto');
            $('#searchProduct').prop('disabled', false);
            toastr.success('Sync VillaTheme successfully');
            refreshCategoriesAndTags();
            $('#searchProduct').trigger('keyup');
        }
        syncBatch('https://villatheme.com/extensions/');
    });

    function refreshCategoriesAndTags() {
        refreshDropdown('php/category_view.php', ['#EditProductCategory', '#AddProductCategory', '#Category'], 'categories', 'category_name');
        refreshDropdown('php/tag_view.php', ['#EditProductTag', '#AddProductTag', '#Tag'], 'tags', 'tag_name');
    }

    function refreshDropdown(url, selectors, dataKey, textKey) {
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                selectors.forEach(selector => {
                    const $select = $(selector);
                    $select.empty();
                    data[dataKey].forEach(item => {
                        $select.append($('<option></option>').val(item.id).text(item[textKey]));
                    });
                    $select.dropdown('refresh');
                });
            },
            error: function (xhr, status, error) {
                console.error(`Error refreshing ${dataKey}:`, error);
                console.error('Response text:', xhr.responseText);
            }
        });
    }
});

function loadProducts(page) {
    $.ajax({
        url: 'php/product_view.php',
        type: 'GET',
        dataType: 'json',
        data: { page: page },
        success: function (data) {
            const tableBody = $('#productTableBody');
            tableBody.empty();
            $.each(data.products, function (i, product) {
                var row = $('<tr>');

                var date = new Date(product.created_date);
                var formattedDate = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/');
                row.append($('<td>').text(product.id).css('display', 'none'));
                row.append($('<td>').text(formattedDate));
                row.append($('<td>').text(product.title));
                row.append($('<td>').text(product.sku));
                row.append($('<td>').text("$" + parseFloat(product.price).toFixed(2)));


                if (product.featured_image) {
                    var featuredImage = $('<img>').attr('src', product.featured_image.replace('../', '')).css({
                        'width': '30px',
                        'height': '30px',
                        'object-fit': 'cover',
                    });
                    row.append($('<td>').html(featuredImage));
                } else {
                    row.append($('<td>').text('No img'));
                }

                var galleryImages = product.gallery ? product.gallery.split(',') : [];
                var firstGalleryImage = galleryImages[0];

                $('.pagination_product').show();
                if (firstGalleryImage) {
                    var galleryImage = $('<img>').attr('src', firstGalleryImage.replace('../', '')).css({
                        'width': '30px',
                        'height': '30px',
                        'object-fit': 'cover'
                    });
                    row.append($('<td>').html(galleryImage));
                } else {
                    row.append($('<td>').text('No img'));
                }

                row.append($('<td>').text(product.categories));
                row.append($('<td>').text(product.tags));
                row.append($('<td>').html('<i class="edit icon editIcon"></i><i class="trash icon trashIcon"></i>').css('white-space', 'nowrap'));
                tableBody.append(row);
            });

            updatePagination(data.total, page);
        },
        error: function (xhr, status, error) {
            console.error("Error fetching products:", error);
        }
    });
}

function updatePagination(total, currentPage) {
    const limit = 5;
    const totalPages = Math.ceil(total / limit);
    const paginationMenu = $('.pagination.menu');
    paginationMenu.empty();

    paginationMenu.append('<a class="item" href="#" id="prevBtn"><i class="arrow left icon"></i></a>');

    const maxVisiblePages = 6;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        paginationMenu.append('<a class="item" href="#">1</a>');
        if (startPage > 2) {
            paginationMenu.append('<span class="item disabled">...</span>');
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationMenu.append('<a class="item' + (i === currentPage ? ' active' : '') + '" href="#">' + i + '</a>');
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationMenu.append('<span class="item disabled">...</span>');
        }
        paginationMenu.append('<a class="item" href="#">' + totalPages + '</a>');
    }

    paginationMenu.append('<a class="item" href="#" id="nextBtn"><i class="arrow right icon"></i></a>');

    paginationMenu.find('.item').click(function (e) {
        e.preventDefault();
        if ($(this).hasClass('disabled')) return;
        const targetPage = $(this).text();
        if ($(this).is('#prevBtn')) {
            if (currentPage > 1) {
                loadProducts(currentPage - 1);
            }
        } else if ($(this).is('#nextBtn')) {
            if (currentPage < totalPages) {
                loadProducts(currentPage + 1);
            }
        } else {
            loadProducts(parseInt(targetPage));
        }
    });
}
function reloadCurrentPage() {
    const currentPage = $('.pagination.menu .item.active').text();
    loadProducts(parseInt(currentPage) || 1);
}

