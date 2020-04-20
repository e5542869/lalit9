var userData = {};
$.getJSON('/Base/GetUserData', function (data) {
    userData = JSON.parse(data);
    $(document).ready(function () {
        setPermissions(userData.InstituteId);
        getCurrentFiscalYear();
        loadOrgNamesDropdown();
        loadVocherTypeDropdown();
        $('#colCredit').css('display', 'none');
        $('#ddlVocherTypes').on('change', function () {
            var selectedVocher = $("#ddlVocherTypes option:selected").val();
            if (selectedVocher == '') {
                $('#txtVoucherNo').removeAttr('disabled');
                $('#txtVoucherNo').val('');
                alert('Please select Vocher type');
                return false;
            }
            if (userData.FinancialYearId == 4) {
                $('#txtVoucherNo').removeAttr('disabled');
                $('#txtVoucherNo').val('');
            }
            else {
                $.ajax({
                    type: "GET",
                    url: '/Transactions/SelectMaximumNewVoucherNoAutoGenerate',
                    data: { VoucherTypeId: selectedVocher },
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    beforeSend: function () {
                        ShowLoading();
                    },
                    success: function (data) {
                        var newVoucherNo = data + "/" + $('#txtDate').val() + "/" + userData.InstituteId;
                        $('#txtVoucherNo').attr('disabled', 'disabled');
                        $('#txtVoucherNo').val(newVoucherNo);
                    },
                    error: function (error) { console.log(error); },
                    complete: function () {
                        HideLoading();
                    }
                });
            }
        });
        $('#btnProceed').on('click', function () {
            var selectedVocher = $("#ddlVocherTypes option:selected").val();
            if (selectedVocher == '') {
                alert('Please select Vocher type');
                return false;
            }
            var voucherNo = $("#txtVoucherNo").val();
            if (voucherNo == '') {
                alert('Please select Voucher No');
                return false;
            }
            var chequeOrCash = $("#txtChequeOrCash").val();
            if (chequeOrCash == '') {
                alert('Please select cheque no./cash');
                return false;
            }
            $('#dvAddnewLedger').css('display', 'block');
            loadLedgersDropdown();
            var selectedVocher = $("#ddlVocherTypes option:selected").val();
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
            $('#btnProceed').addClass('novisibility');
        });
        $('#ddlCrorDr').on('change', function () {
            var selectedLedger = $("#ddlLedgers option:selected").val();
            var crordr = $("#ddlCrorDr option:selected").val();
            if (selectedLedger > 0) {
                var totalDebit = $('#lblDebitAmount').text();
                var totalCredit = $('#lblCreditAmount').text();
                if (crordr == 'C' && parseFloat(totalCredit) < parseFloat(totalDebit)) {
                    var ceditVal = parseFloat(totalDebit) - parseFloat(totalCredit);
                    $('#txtCredit').val(ceditVal);
                }
                if (crordr == 'D' && parseFloat(totalDebit) < parseFloat(totalCredit)) {
                    var debitVal = parseFloat(totalCredit) - parseFloat(totalDebit);
                    $('#txtDebit').val(debitVal);
                }
            }
            if (crordr == 'C') {
                $('#txtDebit').val('');
                $('#colDebit').css('display', 'none');
                $('#colCredit').css('display', 'block');
            }
            else {
                $('#txtCredit').val('');
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
                if (crordr == 'C' && parseFloat(totalCredit) < parseFloat(totalDebit)) {
                    var ceditVal = parseFloat(totalDebit) - parseFloat(totalCredit);
                    $('#txtCredit').val(ceditVal);
                }
                if (crordr == 'D' && parseFloat(totalDebit) < parseFloat(totalCredit)) {
                    var debitVal = parseFloat(totalCredit) - parseFloat(totalDebit);
                    $('#txtDebit').val(debitVal);
                }
            }
        });
        $('#btnAddTolistProceed').on('click', function () {
            var ledgerId = $("#ddlLedgers option:selected").val();
            if (ledgerId == '' || ledgerId == 0) {
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
            if (debit == '')
                debit = 0;
            if (credit == '')
                credit = 0;
            var selectedLedger = $("#ddlLedgers option:selected").text();

            $('#dvNewLedgertable').css('display', 'block');
            var markup = "<tr><td><input type='checkbox' name='record'></td><td>" + $("#ddlCrorDr option:selected").val() + "</td><td>" + $("#ddlLedgers option:selected").val() + "</td><td>" + selectedLedger + "</td><td class='align-right'>" + parseFloat(debit).toFixed(2) + "</td><td class='align-right'>" + parseFloat(credit).toFixed(2) + "</td></tr>";
            $("#tblNewLedger tbody").append(markup);

            calculateTotal(debit, credit);

            var debit = $("#txtDebit").val('');
            var credit = $("#txtCredit").val('');
            $("#ddlLedgers").val(0);
            $("#ddlCrorDr").focus();
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
            var totalDebit = $('#lblDebitAmount').text();
            var totalCredit = $('#lblCreditAmount').text();
            if (parseFloat(totalDebit) != parseFloat(totalCredit)) {
                alert("Debit and Credit amout not equal");
                return false;
            }
            var narration = $('#txtNarration').val();
            if (narration.length < 5) {
                alert("Please enter Master narration");
                return false;
            }
            AddTransactiontoDb(narration);
        });
    });
});
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
            var optionhtml = '<option value="">Select Type</option>';
            $("#ddlVocherTypes").append(optionhtml);
            $.each(data, function (i) {
                var optionhtml = '<option value="' +
                    data[i].VoucherTypeId + '">' + data[i].VoucherTypeName + '</option>';
                $("#ddlVocherTypes").append(optionhtml);
            });
        },
        error: function (error) { console.log(error); },
        complete: function () {
            HideLoading();
        }
    });
}
const filter = function (input, data) {
    return data.filter(x => {
        return (!x.ignore && ~x.LedgerName.indexOf(input)) || x.LedgerName === input
    });
};
const validation = function (inputValue, data) {
    if (inputValue) {
        let matches = data.filter(x => x.id === +this.selected.value && x.LedgerName === inputValue);
        if (!matches || !matches.length) {
        }
        return true;
    }
};
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
            $('#ddlLedgers').empty();
            var optionhtml = '<option value="0">Select Ledger</option>';
            $("#ddlLedgers").append(optionhtml);
            $.each(data, function (i) {
                var optionhtml = '<option value="' +
                    data[i].LedgerId + '">' + data[i].LedgerName + '</option>';
                $("#ddlLedgers").append(optionhtml);
            });
            $("#ddlLedgers").combobox();
        },
        error: function (error) { console.log(error); },
        complete: function () {
            HideLoading();
        }
    });
}
function calculateTotal(debit, credit) {
    var debitAmount = 0, creditAmount = 0;
    $('#tblNewLedger > tbody  > tr').each(function (rowIndex) {
        var colAmount1 = $('#tblNewLedger > tbody  > tr').eq(rowIndex).find('td').eq(4).html();
        var colAmount2 = $('#tblNewLedger > tbody > tr').eq(rowIndex).find('td').eq(5).html();
        if (parseFloat(colAmount1) > 0)
            debitAmount = parseFloat(debitAmount) + parseFloat(colAmount1);
        if (parseFloat(colAmount2) > 0)
            creditAmount = parseFloat(creditAmount) + parseFloat(colAmount2);
    });
    $('#lblDebitAmount').text(parseFloat(debitAmount).toFixed(2));
    $('#lblCreditAmount').text(parseFloat(creditAmount).toFixed(2));
}
function AddTransactiontoDb(narration) {
    var dept = $('#ddlInstitute option:selected').val();
    var selectedVocher = $("#ddlVocherTypes option:selected").val();
    var vocherNo = $('#txtVoucherNo').val();
    var chequeOrCash = $('#txtChequeOrCash').val();
    var totalDebit = $('#lblDebitAmount').text();
    var totalCredit = $('#lblCreditAmount').text();
    var trasDate = $('#txtDate').val().split('.');
    if (trasDate.length == 3) {
        var month = parseInt(trasDate[1]) - 1;
        var trnsactionDate = new Date(trasDate[2], month, trasDate[0]);
        var ledgerData = [];
        $('#tblNewLedger > tbody  > tr').each(function (rowIndex) {
            var CrorDr = $('#tblNewLedger > tbody  > tr').eq(rowIndex).find('td').eq(1).html();
            var selectedLedger = $('#tblNewLedger > tbody  > tr').eq(rowIndex).find('td').eq(2).html();
            var debit = $('#tblNewLedger > tbody  > tr').eq(rowIndex).find('td').eq(4).html();
            var credit = $('#tblNewLedger > tbody > tr').eq(rowIndex).find('td').eq(5).html();
            var ledger = { "CrorDr": CrorDr, "LedgerId": selectedLedger, "Debit": debit, "Credit": credit };
            ledgerData.push(ledger);
        });
        var transactionsViewModel = { DeptId: dept, VocherType: selectedVocher, NewVocherNo: vocherNo, ChequeorCash: chequeOrCash, TotalDebit: totalDebit, TotalCredit: totalCredit, MasterNarration: narration, accountLedgers: ledgerData, TransactionDate: trnsactionDate.toISOString() };
        $.ajax({
            type: "POST",
            url: '/Transactions/AddTransactions',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(transactionsViewModel),
            dataType: "json",
            beforeSend: function () {
                ShowLoading();
            },
            success: function (data) {
                alert(data.message)
                clearAllControls();
                $('#spnOpenBalance').text('Cash Balance: ' + data.cashBalance);
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
    if ($('#btnProceed').hasClass('novisibility'))
        $('#btnProceed').removeClass('novisibility')
    $('#btnProceed').addClass('visibility');
}

function getCurrentFiscalYear() {
    var selectedFinYear = new Date(userData.FinancialYearEndDate);
    var todayDate = new Date();

    if (selectedFinYear.getFullYear() == todayDate.getFullYear() || userData.FinancialYearId == '9') {
        var month = selectedFinYear.getMonth() + 1;
        if (selectedFinYear.getDay() == 0) {
            $('#txtDate').val(selectedFinYear.getDate() - 1 + "." + month + "." + selectedFinYear.getFullYear());
        }
        else
            $('#txtDate').val(selectedFinYear.getDate() + "." + month + "." + selectedFinYear.getFullYear());
    }
    else {
        var month = todayDate.getMonth() + 1;
        $('#txtDate').val(todayDate.getDate() + "." + month + "." + todayDate.getFullYear());
    }
}

//function getCurrentFiscalYear() {   //changed on 22-02-20
//    if (userData.FinancialYearEndDate.indexOf("2017") != "-1") {
//        var selectedFinYear = new Date(userData.FinancialYearEndDate);
//    }
//    else {
//        var selectedFinYear = new Date(userData.FinancialYearStartDate);
//}
//    var todayDate = new Date();

//    if (selectedFinYear.getFullYear() == todayDate.getFullYear() || userData.FinancialYearEndDate.indexOf("2017") != "-1") {
//        var month = selectedFinYear.getMonth() + 1;
//        if (selectedFinYear.getDay() == 0) {
//            $('#txtDate').val(selectedFinYear.getDate() - 1 + "." + month + "." + selectedFinYear.getFullYear());
//        }
//        else
//            $('#txtDate').val(selectedFinYear.getDate() + "." + month + "." + selectedFinYear.getFullYear());
//    }
//    else {
//        var month = todayDate.getMonth() + 1;
//        $('#txtDate').val(todayDate.getDate() + "." + month + "." + todayDate.getFullYear());
//    }
//}