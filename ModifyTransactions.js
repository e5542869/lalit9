var userData = {};
$.getJSON('/Base/GetUserData', function (data) {
    userData = JSON.parse(data);
    $(document).ready(function () {
        setPermissions(userData.InstituteId);
        $('#colCredit').css('display', 'none');
        $('#btnSearch').on('click', function () {
            var selectedVocher = $("#ddlSearchVocherTypes option:selected").val();
            if (selectedVocher == '') {
                alert('Please select Vocher type');
                return false;
            }
            var voucherNo = $("#txtSearchVoucherNo").val();
            if (voucherNo == '') {
                alert('Please select Voucher No');
                return false;
            }
            var crORdr = selectedVocher != 5 ? "D" : "C";
            $('#ddlCrorDr').val(crORdr);
            if (crORdr == "C") {
                $('#colDebit').css('display', 'none');
                $('#colCredit').css('display', 'block');
            }
            if (crORdr == "D") {
                $('#colCredit').css('display', 'none');
                $('#colDebit').css('display', 'block');
            }

            loadTansactionsDetails(selectedVocher, voucherNo);
        });
        var todayDate = new Date();
        var month = todayDate.getMonth() + 1;
        $('#txtDate').val(todayDate.getDate() + "." + month + "." + todayDate.getFullYear());
        loadOrgNamesDropdown();
        loadVocherTypeDropdown();
        $('#ddlCrorDr').on('change', function () {
            var selectedLedger = $("#ddlLedgers option:selected").val();
            var crordr = $("#ddlCrorDr option:selected").val();
            if (selectedLedger > 0) {
                var totalDebit = $('#lblDebitAmount').text();
                var totalCredit = $('#lblCreditAmount').text();
                if (crordr == 'C' && totalCredit < totalDebit) {
                    var ceditVal = parseFloat(totalDebit) - parseFloat(totalCredit);
                    //ceditVal = ceditVal + parseFloat(totalCredit);
                    $('#txtCredit').val(ceditVal);
                }
                if (crordr == 'D' && totalDebit < totalCredit) {
                    var debitVal = parseFloat(totalCredit) - parseFloat(totalDebit);
                    // debitVal = debitVal + parseFloat(totalDebit);
                    $('#txtDebit').val(debitVal);
                }
            }
            if (crordr == 'C') {
                $('#colDebit').css('display', 'none');
                $('#colCredit').css('display', 'block');
            }
            else {
                $('#colCredit').css('display', 'none');
                $('#colDebit').css('display', 'block');
            }
        });
        $('#ddlLedgers').on('change', function () {
            var selectedLedger = $("#ddlLedgers option:selected").val();
            var crordr = $("#ddlCrorDr option:selected").val();
            if (selectedLedger > 0) {
                var totalDebit = $('#lblDebitAmount').text();
                var totalCredit = $('#lblCreditAmount').text();
                if (crordr == 'C' && totalCredit < totalDebit) {
                    var ceditVal = parseFloat(totalDebit) - parseFloat(totalCredit);
                    // ceditVal = ceditVal + parseFloat(totalCredit);
                    $('#txtCredit').val(ceditVal);
                }
                if (crordr == 'D' && totalDebit < totalCredit) {
                    var debitVal = parseFloat(totalCredit) - parseFloat(totalDebit);
                    //  debitVal = debitVal + parseFloat(totalDebit);
                    $('#txtDebit').val(debitVal);
                }
            }
        });
        $('#btnAddTolistProceed').on('click', function () {
            var selectedLedger = $("#ddlLedgers option:selected").text();
            if (selectedLedger == '' && selectedLedger == '0') {
                alert('Please select account ledger');
                return false;
            }

            var debit = $("#txtDebit").val();
            var credit = $("#txtCredit").val();
            if (debit != '' || credit != '') {

            }
            else {
                alert('Please enter debit or credit');
                return false;
            }
            $('#dvNewLedgertable').css('display', 'block');
            var markup = "<tr><td><input type='checkbox' name='record'></td><td>" + $("#ddlCrorDr option:selected").val() + "</td><td>" + $("#ddlLedgers option:selected").val() + "</td><td>" + selectedLedger + "</td><td>" + debit + "</td><td>" + credit + "</td></tr>";
            $("#tblNewLedger tbody").append(markup);

            calculateTotal(debit, credit);

            var debit = $("#txtDebit").val('');
            var credit = $("#txtCredit").val('');
            $("#ddlLedgers").val(0);
        });
        // Find and remove selected table rows
        $("#btnDeleteRow").click(function () {
            var checkedValues = $("input[name='record']:checked").val();
            if (checkedValues == undefined) {
                alert('Please select atleast one ledger to delete');
                return;
            }
            $("#tblNewLedger tbody").find('input[name="record"]').each(function () {
                if ($(this).is(":checked")) {
                    $(this).parents("tr").remove();
                }
            });
            calculateTotal(0, 0);
        });
        $("#btnAddTransaction").on("click", function () {
            var narration = $('#txtNarration').val();
            if (narration.length < 5) {
                alert("Please enter Master narration");
                return false;
            }
            AddTransactiontoDb(narration);
        });
        loadLedgersDropdown();
        var selectedVocher = $("#ddlSearchVocherTypes option:selected").val();
        var crORdr = selectedVocher != 5 ? "D" : "C";
        $('#ddlCrorDr').val(crORdr);
     
    });
});
function loadVocherTypeDropdown() {
    $.ajax({
        type: "GET",
        url: '/Transactions/GetVoucherTypes',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function () {
            ShowLoading();
        },
        success: function (data) {
            var voucherType = getUrlParameter('voucherType');
            var optionhtml = '<option value="">Select Type</option>';
             $("#ddlVocherTypes").append(optionhtml);
            $("#ddlSearchVocherTypes").append(optionhtml);
            $.each(data, function (i) {
                if (voucherType != data[i].VoucherTypeName) {
                    var optionhtml = '<option value="' +
                        data[i].VoucherTypeId + '">' + data[i].VoucherTypeName + '</option>';
                }
                else if (voucherType == data[i].VoucherTypeName)
                {
                    var optionhtml = '<option value="' +
                       data[i].VoucherTypeId + '" selected>' + data[i].VoucherTypeName + '</option>';
                }
              
                $("#ddlVocherTypes").append(optionhtml);
                $("#ddlSearchVocherTypes").append(optionhtml);
    
            });
        },
        error: function (error) { console.log(error); }
    });
}
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
function loadTansactionsDetails(vocherType, vocherNumber) {
    if ($.fn.DataTable.isDataTable("#tblNewLedger")) {
        $('#tblNewLedger').DataTable().draw();
        $('#tblNewLedger').DataTable().destroy();
        $('#tblNewLedger tbody').empty();
    }
    $('#tblNewLedger').DataTable({
        bProcessing: true,
        language: {
            search: "",
            searchPlaceholder: "Search records"
        },
        aoColumnDefs: [{ "bSortable": false, "aTargets": [0, 1, 2, 3, 4, 5] }],
        ajax: {
            url: "TransactionMasterAndDetailByVoucherNo",
            type: "POST",
            data: { vocherType: vocherType, vocherNumber: vocherNumber },
            dataSrc: function (json) {
                if (json.ledgerViewModels == null) {
                    $('#dvLedgertable').css('display', 'none');
                    $('#dvLedgerDetails').css('display', 'none');
                    $('#dvNewLedgerInfo').css('display', 'none');
                    $('#dvAddTransaction').css('display', 'none');
                    alert("Voucher No not found. Please enter valid voucher no");
                    return false;
                }
                else {
                    $('#dvLedgertable').css('display', 'block');
                    $('#dvLedgerDetails').css('display', 'block');
                    var transactionDate = new Date(parseInt(json.TransactionDate.substr(6)));
                    var todayDate = new Date();
                    transactionDate = transactionDate.getDate() + "." + (transactionDate.getMonth() + 1) + "." + transactionDate.getFullYear();
                    todayDate = todayDate.getDate() + "." + (todayDate.getMonth() + 1) + "." + todayDate.getFullYear();
                    $('#ddlVocherTypes').val(json.VoucherTypeId);
                    var splitArray = json.VoucherNo.split("/");
                    $('#txtMasterId').val(json.TransactionMasterId);
                    $('#txtDate').val(transactionDate);
                    $('#txtVoucherNo').val(splitArray[0] + "/" + $('#txtDate').val() + "/" + splitArray[2]);
                    $('#txtChequeOrCash').val(json.ChequeNo);
                    $('#txtNarration').val(json.MasterNarration);
                    //if (transactionDate != todayDate && transactionDate != '30.3.2019') {//changed on 22-02-2020
                    if (transactionDate != todayDate && transactionDate != '31.3.2017' && transactionDate != '31.3.2020') {
                        $('#dvLedgertable').css('display', 'none');
                        $('#dvLedgerDetails').css('display', 'none');
                        $('#dvNewLedgerInfo').css('display', 'none');
                        $('#dvAddTransaction').css('display', 'none');
                        alert("Now you can't make transaction in your previous days. You have to finish your transaction within a same day");
                        return false;
                    }
                    else {
                        $('#dvNewLedgerInfo').css('display', 'block');
                        $('#dvAddTransaction').css('display', 'block');
                    }
                    return json.ledgerViewModels;
                }
            }
        },
        aaSorting: [[2, 'asc']],
        columns: [
            {
                name: "Select",
                render: function () {
                    return "<input type='checkbox' name='record'>";
                }
            },
            {
                name: "Cr/Dr",
                render: function (data, type, row) {
                    if (row.Debit > 0)
                        return 'D';
                    else
                        return 'C';
                }
            },
            { data: "LedgerId", name: "Ledger Id" },
            { data: "LedgerName", name: "LedgerName" },
            {
                name: "Debit",
                className: "align-right",
                data: function (row, type, val, meta) {
                    return parseFloat(row.Debit).toFixed(2);
                }
            },
            {
                name: "Credit",
                className: "align-right",
                data: function (row, type, val, meta) {
                    return parseFloat(row.Credit).toFixed(2);
                }
            }
        ],
        "footerCallback": function (row, data, start, end, display) {
            var api = this.api(), data;

            // converting to interger to find total
            var intVal = function (i) {
                return typeof i === 'string' ?
                    i.replace(/[\$,]/g, '') * 1 :
                    typeof i === 'number' ?
                        i : 0;
            };

            // computing column Total of the complete result          
            var debitTotal = api
                .column(4)
                .data()
                .reduce(function (a, b) {
                    return intVal(a) + intVal(b);
                }, 0);

            var creditTotal = api
                .column(5)
                .data()
                .reduce(function (a, b) {
                    return intVal(a) + intVal(b);
                }, 0);

            $('#lblDebitAmount').text(parseFloat(debitTotal).toFixed(2));
            $('#lblCreditAmount').text(parseFloat(creditTotal).toFixed(2));
        }
    });
}
function loadOrgNamesDropdown() {
    $.ajax({
        type: "GET",
        url: '/Admin/GetDepartmentsList',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function () {
            ShowLoading();
        },
        success: function (data) {
            var optionhtml = '<option value=""></option>';
            $("#ddlInstitute").append(optionhtml);
            $.each(data, function (i) {
                if (userData.InstituteId == data[i].Inst_Id) {
                    var optionhtml = '<option selected="selected" value="' +
                        data[i].Inst_Id + '">' + data[i].Inst_ShortTitle + '</option>';
                }
                else {
                    var optionhtml = '<option value="' +
                        data[i].Inst_Id + '">' + data[i].Inst_ShortTitle + '</option>';
                }
                $("#ddlInstitute").append(optionhtml);
            });
            $("#ddlInstitute").prop("disabled", true);
        },
        error: function (error) { console.log(error); },
        complete: function () {
            HideLoading();
        }
    });
}
function loadLedgersDropdown() {
    $.ajax({
        type: "GET",
        url: '/Admin/GetAccountLedgerList',
        data: { showInTransactionPage: '1' },
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function () {
            ShowLoading();
        },
        success: function (data) {
            var optionhtml = '<option value="0">Select Type</option>';
            $("#ddlLedgers").append(optionhtml);
            $.each(data, function (i) {
                var optionhtml = '<option value="' +
                    data[i].LedgerId + '">' + data[i].LedgerName + '</option>';
                $("#ddlLedgers").append(optionhtml);
            });
        },
        error: function (error) { console.log(error); },
        complete: function () {
            HideLoading();
        }
    });


}
function calculateTotal() {
    var debitAmount = 0, creditAmount = 0;
    $('#tblNewLedger > tbody  > tr').each(function (rowIndex) {
        var colAmount1 = $('#tblNewLedger > tbody  > tr').eq(rowIndex).find('td').eq(4).html();
        var colAmount2 = $('#tblNewLedger > tbody > tr').eq(rowIndex).find('td').eq(5).html();
        if (colAmount1 > 0)
            debitAmount += parseFloat(colAmount1);
        if (colAmount2 > 0)
            creditAmount += parseFloat(colAmount2);
    });
    $('#lblDebitAmount').text(parseFloat(debitAmount).toFixed(2));
    $('#lblCreditAmount').text(parseFloat(creditAmount).toFixed(2));
}
function AddTransactiontoDb(narration) {
    var masterId = $('#txtMasterId').val();
    var dept = $('#ddlInstitute option:selected').val();
     var trasDate = $('#txtDate').val().split('.');
     if (trasDate.length == 3) {
         var month = parseInt(trasDate[1]) - 1;
         var trnsactionDate = new Date(trasDate[2], month, trasDate[0]);
         var selectedVocher = $("#ddlVocherTypes option:selected").val();
         var vocherNo = $('#txtVoucherNo').val();
         var chequeOrCash = $('#txtChequeOrCash').val();
         var totalDebit = $('#lblDebitAmount').text();
         var totalCredit = $('#lblCreditAmount').text();

         var ledgerData = [];
         $('#tblNewLedger > tbody  > tr').each(function (rowIndex) {
             var CrorDr = $('#tblNewLedger > tbody  > tr').eq(rowIndex).find('td').eq(1).html();
             var selectedLedger = $('#tblNewLedger > tbody  > tr').eq(rowIndex).find('td').eq(2).html();
             var debit = $('#tblNewLedger > tbody  > tr').eq(rowIndex).find('td').eq(4).html();
             var credit = $('#tblNewLedger > tbody > tr').eq(rowIndex).find('td').eq(5).html();
             var ledger = { "CrorDr": CrorDr, "LedgerId": selectedLedger, "Debit": debit, "Credit": credit };
             ledgerData.push(ledger);
         });
         var transactionsViewModel = { MasterTransactionId: masterId, TransactionDate: trnsactionDate, DeptId: dept, VocherType: selectedVocher, NewVocherNo: vocherNo, ChequeorCash: chequeOrCash, TotalDebit: totalDebit, TotalCredit: totalCredit, MasterNarration: narration, accountLedgers: ledgerData };
         $.ajax({
             type: "POST",
             url: '/Transactions/UpdateTransactions',
             contentType: "application/json; charset=utf-8",
             data: JSON.stringify(transactionsViewModel),
             dataType: "json",
             beforeSend: function () {
                 ShowLoading();
             },
             success: function (data) {
                 alert(data.message)
                 clearAllControls();
                 $('#dvLedgertable').css('display', 'none');
                 $('#dvLedgerDetails').css('display', 'none');
                 $('#dvNewLedgerInfo').css('display', 'none');
                 $('#dvAddTransaction').css('display', 'none');
             },
             error: function (error) { console.log(error); },
             complete: function () {
                 HideLoading();
             }
         });

     }
}
function clearAllControls() {
    $("#txtDebit").val('');
    $("#txtCredit").val('');
    $("#ddlLedgers").val(0);
    $('#dvNewLedgertable').css('display', 'none');
    $('#dvAddnewLedger').css('display', 'none');
    $('#txtChequeOrCash').val('');
    $('#txtNarration').val('');
    $('#txtVoucherNo').val('');
    $("#ddlVocherTypes").val(0);
    $("#tblNewLedger > tbody  > tr").remove();
    $("#ddlSearchVocherTypes").val(0);
    $("#txtSearchVoucherNo").val('');
}