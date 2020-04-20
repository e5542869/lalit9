var userData = {};
$.getJSON('/Base/GetUserData', function (data) {
    userData = JSON.parse(data);
    $(document).ready(function () {
        setPermissions(userData.InstituteId);
        loadAccountLedgerList();
        loadddlAccountGroup();
        $('#btnDeleteRec').on('click', function () {
            deleteLedgerRecord();
        });
        $('#OpeningBalance').val('0');
    });
});
function loadAccountLedgerList() {
    if ($.fn.DataTable.isDataTable("#tblLedgerList")) {
        $('#tblLedgerList').DataTable().draw();
        $('#tblLedgerList').DataTable().destroy();
        $('#tblLedgerList tbody').empty();
    }
    $('#tblLedgerList').DataTable({
        processing: true,
        pageLength: 50,
        dom:
            "<'row'<'col-sm-3'l><'col-sm-4 text-center'f><'col-sm-5'B>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-5'i><'col-sm-7'p>>",
        language: {
            search: "",
            searchPlaceholder: "Search records",
            sEmptyTable: "No ledgers available"
        },
        columnDefs: [
            { className: "dt-right", targets: [0] }
        ],
        buttons: [
            {
                extend: 'excelHtml5',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5]
                }
            },
            {
                extend: 'pdfHtml5',
                title: 'Khalsa College Charitable Society, Amritsar',
                message: userData.InstName,
                orientation: 'landscape',
                pageSize: 'LEGAL',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5]
                },
                customize: function (doc) {
                    var rowCount = doc.content[2].table.body.length;
                    for (i = 0; i < rowCount; i++) {
                        doc.content[2].table.body[i][3].alignment = 'right';
                    };
                }
            },
            {
                extend: 'print',
                title: '',
                message: "<div class='row'><h3 class='text-center'>Khalsa College Charitable Society, Amritsar</h3></div>" +
                    "<div class='row exportoption'><h4 class='text-center'>" + userData.InstName + "</h4></div>",
                orientation: 'landscape',
                pageSize: 'LEGAL',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5]
                },
                customize: function (win) {
                    $(win.document.body).find('table th td:nth-child(4)')
                        .addClass('align-right');
                    $(win.document.body).find('table tr td:nth-child(4)')
                        .addClass('align-right');
                    $(win.document.body).find('table tr th:nth-child(2),table tr td:nth-child(2)').css('width', '200px');

                }
            },
        ],
        ajax: {
        
            type: "GET",
            url: '/Admin/GetAccountLedgerList',
            data: { showInTransactionPage: '0' },
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            dataSrc: function (accountLedgerList) {
                return accountLedgerList;
            }
        },
        columns: [
            { data: "LedgerId", name: "LedgerId" },
            { data: "LedgerName", name: "Ledger Name" },
            { data: "AccountGroupName", name: "Group" },
            {
                name: "Opening Balance",
                className: "align-right",
                render: function (data, type, full, meta) {
                    return parseFloat(full.OpeningBalance).toFixed(2);
                }
            },
            { data: "CrOrDr", name: "Cr/Dr" },
            { data: "Inst_ShortTitle", name: "Org Name" },
            {
                "title": "Edit",
                "data": "AssetID",
                "searchable": false,
                "sortable": false,
                className: "tr-edit",
                "render": function (data, type, full, meta) {
                    if (userData.IsOpeningBalanceEditAllow) {
                        return '<a href="#" onClick="editAccountLedger(' + full.LedgerId + ')" class="btn btn-primary btn-padding">Edit</a>';
                    }
                    else {
                        return '';
                    }
                }
            },
            {
                "title": "Delete",
                "data": "AssetID",
                "searchable": false,
                "sortable": false,
                className: "tr-edit",
                "render": function (data, type, full, meta) {
                    if (userData.IsOpeningBalanceEditAllow) {
                        return '<a href="#" onClick="deleteAccountLedger(' + full.LedgerId + ')" class="btn btn-danger btn-padding">Delete</a>';
                    } else {
                        return '';
                    }
                }
            },
             {
                 "title": "Enable/Disable",
                 "data": "LedgerId",
                 "searchable": false,
                 "sortable": false,
                 className: "tr-edit",
                 "render": function (data, type, full, meta) {
                     if (userData.IsOpeningBalanceEditAllow && full.IsEnable == '1' && userData.FinancialYearId == '9') {
                         return '<a href="#" onClick="enableAccountLedger(' + full.LedgerId + ',' + full.IsEnable + ')" class="btn btn-success btn-padding" id="btnDisable">Disable</a>';
                     }
                     else if (userData.IsOpeningBalanceEditAllow && full.IsEnable == '0' && userData.FinancialYearId == '9') {
                         return '<a href="#" onClick="enableAccountLedger(' + full.LedgerId + ',' + full.IsEnable + ')" class="btn btn-danger btn-padding" id="btnEnable">Enable</a>';
                     }
                     else
                         return '';
                 }
             }
        ]
    });
}
function loadddlAccountGroup() {
    $.ajax({
        type: "GET",
        url: '/Admin/GetAccountGroupsList',
        data: { showInLedger: '1', financialYearId: userData.FinancialYearId },
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function () {
            ShowLoading();
        },
        success: function (data) {
            var optionhtml = '<option value=""></option>';
            $.each(data, function (i) {
                var optionhtml = '<option value="' +
                    data[i].AccountGroupId + '">' + data[i].AccountGroupName + '</option>';
                $("#AccountGroupId").append(optionhtml);
            });
        },
        error: function (error) { console.log(error); },
        complete: function () {
            HideLoading();
        }
    });
}
function accountLedgerOnSuccess(successResult) {
    if (successResult == true) {
        $("#form0")[0].reset();
        alert("Ledger saved successfully");
        loadAccountLedgerList();
    }
    else {
        alert(successResult);
    }

}
function accountLedgeronFailure() {
    alert('error occured while saving the data');
}
function editAccountLedger(ledgerId) {
    $.ajax({
        type: "GET",
        url: '/Admin/GetAccountLedger',
        data: { ledgerId: ledgerId,showInTransactionPage: '0'},
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function () {
            ShowLoading();
        },
        success: function (data) {
            $('#LedgerId').val(data.LedgerId);
            $('#LedgerName').val(data.LedgerName);
            $('#AccountGroupId').val(data.AccountGroupId);
            $('#OpeningBalance').val(data.OpeningBalance);
            $('#CrOrDr').val(data.CrOrDr);
            $('#Mobile').val(data.Mobile);
            $('#TIN').val(data.TIN);
            $('#CST').val(data.CST);
            $('#PAN').val(data.PAN);
            $('#Address').val(data.Address);
            $('#Narration').val(data.Narration);
        },
        error: function (error) { console.log(error); },
        complete: function () {
            HideLoading();
        }
    });
}
function enableAccountLedger(ledgerId, btnText) {
    if (btnText == 1)
        btnText = "Disable";
    else
        btnText = "Enable";

    $.ajax({
        type: "GET",
        url: '/Admin/EnableAccountLedger',
        data: { ledgerId: ledgerId, btnText: btnText },
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function () {
            ShowLoading();
        },
        success: function (data) {
            loadAccountLedgerList();
            alert(data);
        },
        error: function (error) { console.log(error); },
        complete: function () {
            HideLoading();
        }
    });

}
function deleteAccountLedger(ledgerId) {
    $('#hdnGroupId').val(ledgerId);
    $('#deleteModel').modal('show');
}
function deleteLedgerRecord() {
    var ledgerId = $('#hdnGroupId').val();
    $.ajax({
        type: "GET",
        url: '/Admin/DeleteAccountLedger',
        data: { ledgerId: ledgerId },
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function () {
            ShowLoading();
        },
        success: function (data) {
            $('#deleteModel').modal('hide');
            loadAccountLedgerList();
            alert(data);
        },
        error: function (error) { console.log(error); },
        complete: function () {
            HideLoading();
        }
    });
}
function validateLedgerfrom() {
    if (!userData.IsNewLedgerAddAllow) {
        var lederId = $('#LedgerId').val();
        if (lederId == 0 || lederId == undefined) {
            alert("You don't have permissions to add new ledger.. Please contact adminstrator");
            return false;
        }
    }
    if (!userData.IsOpeningBalanceEditAllow) {
        var lederId = $('#LedgerId').val();
        if (lederId > 0) {
            alert("You don't have permissions to modify the ledger.. Please contact adminstrator");
            return false;
        }
    }
}




