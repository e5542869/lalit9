var userData = {};
var now = new Date();
$.getJSON('/Base/GetUserData', function (data) {
    userData = JSON.parse(data);
    $(document).ready(function () {
        setPermissions(userData.InstituteId);
        var startDate = new Date(userData.FinancialYearStartDate);
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0);
        var endDate = new Date(userData.FinancialYearEndDate);
        var CurrentDate = new Date();
        if (endDate > CurrentDate) {
            endDate = CurrentDate;
        }
        else {
            endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0, 0, 0);
        }
        loadOrgNamesDropdown('ddlAccountGroupInstitute');
        loadddlAccountGroup();
        $('#dtAccountGroupStaringDate,#txtAccountGroupStaringDate').datepicker({
            format: "dd/mm/yyyy",
            autoclose: true,
            startDate: startDate,
            endDate: endDate,
            todayHighlight: true,
        });
        $('#dtAccountGroupEndingDate,#txtAccountGroupEndingDate').datepicker({
            format: "dd/mm/yyyy",
            autoclose: true,
            startDate: startDate,
            endDate: endDate,
            todayHighlight: true,
        });
        var today = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        $('#txtAccountGroupStaringDate').datepicker('setDate', startDate);
        $('#txtAccountGroupEndingDate').datepicker('setDate', today);

        $('#btnAccountGroupView').on('click', function () {
            var fromDate = $('#txtAccountGroupStaringDate').val();
            if (fromDate == '' || !ValidateDate(fromDate)) {
                alert('Please select valid start date');
                return false;
            }
            var toDate = $('#txtAccountGroupEndingDate').val();
            if (toDate == '' || !ValidateDate(toDate)) {
                alert('Please select valid end date');
                return false;
            }
            var instituteId = $("#ddlAccountGroupInstitute option:selected").val();
            if (instituteId == '') {
                alert('Please select valid institute');
                return false;
            }
            var groupId = $("#ddlAccountGroups option:selected").val();

            bindSchedulewiseReport(ConverttoDate(fromDate), ConverttoDate(toDate), instituteId, groupId);
        });

    });
});
function loadOrgNamesDropdown(controlId) {
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
            $("#" + controlId).append(optionhtml);
            $.each(data, function (i) {
                if (userData.InstituteId == data[i].Inst_Id) {
                    var optionhtml = '<option selected="selected" value="' +
                        data[i].Inst_Id + '">' + data[i].Inst_ShortTitle + '</option>';
                }
                else {
                    var optionhtml = '<option value="' +
                        data[i].Inst_Id + '">' + data[i].Inst_ShortTitle + '</option>';
                }
                $("#" + controlId).append(optionhtml);
            });
        },
        error: function (error) { console.log(error); },
        complete: function () {
            HideLoading();
        }
    });
}
function loadddlAccountGroup() {
    $.ajax({
        type: "GET",
        url: '/Admin/GetAccountGroupsList',
        data: {  showInLedger: '0',financialYearId: userData.FinancialYearId },
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function () {
            ShowLoading();
        },
        success: function (data) {
            $.each(data, function (i) {
                var optionhtml = '<option value="' +
                    data[i].AccountGroupId + '">' + data[i].AccountGroupName + '</option>';
                $("#ddlAccountGroups").append(optionhtml);
            });
        },
        error: function (error) { console.log(error); },
        complete: function () {
            HideLoading();
        }
    });
}
function bindSchedulewiseReport(fromDate, toDate, instituteId, groupId) {
    if ($.fn.DataTable.isDataTable("#tblScheduleWiseReport")) {
        $('#tblScheduleWiseReport').DataTable().draw();
        $('#tblScheduleWiseReport').DataTable().destroy();
        $('#tblScheduleWiseReport tbody').empty();
    }
    $('#tblScheduleWiseReport').DataTable({
        bProcessing: true,
        pageLength: 100,
        paging: false,
        dom:
            "<'row'<'col-sm-3'l><'col-sm-4 text-center'f><'col-sm-5'B>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-5'i><'col-sm-7'p>>",
        language: {
            search: "",
            searchPlaceholder: "Search records"
        },
        columnDefs: [{
            className: "dt-right",
            targets: [0]
        }],
        buttons: [
            {
                extend: 'excelHtml5',
                exportOptions: {
                    columns: [1, 2, 3]
                },
                footer: true
            },
            {
                pageSize: 'A4',
                extend: 'pdfHtml5',
                filename: 'Schedule Wise Report For Group_' + now.getDate() + '-' + (now.getMonth() + 1) + '-' + now.getFullYear(),
                title: 'Export',
                header: true,
                customize: function (doc) {
                    doc.content.splice(0, 1, {
                        text: [{
                            text: 'Khalsa College Charitable Society, Amritsar \n',
                            bold: true,
                            fontSize: 14
                        }, {
                            text: userData.InstName + ' \n',
                            bold: true,
                            fontSize: 11
                        }, {
                            text: 'Schedule Wise Report For Group Name:' + $("#ddlAccountGroupInstitute option:selected").text() + ' From(' + fromDate.getDate() + '/' + (fromDate.getMonth() + 1) + '/' + fromDate.getFullYear() + '-' + toDate.getDate() + '/' + (toDate.getMonth() + 1) + '/' + toDate.getFullYear() + ')',
                            bold: true,
                            fontSize: 11
                        }],
                        margin: [0, 0, 0, 12],
                        alignment: 'center'
                    });
                    doc.defaultStyle.fontSize = 8;
                    doc.styles.tableHeader.fontSize = 8;
                    doc.content[1].table.widths = ['60%', '20%', '20%'];   
                    var rowCount = doc.content[1].table.body.length;
                    for (i = 0; i < rowCount; i++) {
                        doc.content[1].table.body[i][1].alignment = 'right';
                        doc.content[1].table.body[i][2].alignment = 'right';
                    };
                    doc['footer'] = (function (page, pages) {
                        return {
                            columns: [
                                {
                                    alignment: 'right',
                                    text: ['page ', { text: page.toString() }, ' of ', { text: pages.toString() }]
                                }
                            ],
                            margin: 20
                        }
                    });
                    var objLayout = {};
                    objLayout['hLineWidth'] = function (i) { return .5; };
                    objLayout['vLineWidth'] = function (i) { return .5; };
                    objLayout['hLineColor'] = function (i) { return '#aaa'; };
                    objLayout['vLineColor'] = function (i) { return '#aaa'; };
                    objLayout['paddingLeft'] = function (i) { return 4; };
                    objLayout['paddingRight'] = function (i) { return 4; };
                    doc.content[1].layout = objLayout;
                },
                exportOptions: {
                    columns: [1, 2, 3]
                },
                footer: true
            },
            {
                extend: 'print',
                title: '',
                message: "<div class='row'><h3 class='text-center'>Khalsa College Charitable Society, Amritsar</h3></div>" +
                    "<div class='row exportoption'><h4 class='text-center'>" + userData.InstName + "</h4></div>" +
                    "<div class='row exportoption'><h4 class='text-center'> Schedule Wise Report For Group Name:" + $("#ddlAccountGroupInstitute option:selected").text() + ",  From (" + fromDate.getDate() + "/" + (fromDate.getMonth() + 1) + "/" + fromDate.getFullYear() + " -" + toDate.getDate() + "/" + (toDate.getMonth() + 1) + "/" + toDate.getFullYear() + ")</h4></div> ",
                orientation: 'landscape',
                pageSize: 'LEGAL',
                customize: function (win) {
                    $(win.document.body).find('table tr th:nth-child(2)').css('text-align', 'right');
                    $(win.document.body).find('table tr th:nth-child(3)').css('text-align', 'right');

                    $(win.document.body).find('table tr td:nth-child(2),table tr td:nth-child(3)')
                        .addClass('align-right');
                },
                exportOptions: {
                    columns: [1, 2, 3]
                },
                footer: true
            },
        ],
        ajax: {
            type: "POST",
            url: "GetScheduledWiseReport",
            data: { 'fromDate': fromDate.toISOString(), 'toDate': toDate.toISOString(), 'instituteId': instituteId, 'groupId': groupId },
            dataSrc: function (model) {
                return model;
            }
        },
        aoColumnDefs: [{ "bSortable": false, "aTargets": [0, 1, 2, 3] }],
        columns: [
            {
                name: "Id",
                data: "Id",
                visible: false

            },
            {
                name: "Name Of Organization",
                render: function (data, type, row) {
                    if (row.AccountGroupName != null)
                        return row.AccountGroupName;
                    else
                        return '';
                }
            },
            {
                name: "Credit",
                className: "align-right",
                data: function (data, type, row) {
                    if (data.Credit != null && data.Credit != '')
                        return parseFloat(data.Credit).toFixed(2);
                    else
                        return 0.00;
                }
            },
            {
                name: "Debit",
                className: "align-right",
                data: function (data, type, row) {
                    if (data.Debit != null && data.Debit != '')
                        return parseFloat(data.Debit).toFixed(2);
                    else
                        return 0.00;
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
                .column(3)
                .data()
                .reduce(function (a, b) {
                    return intVal(a) + intVal(b);
                }, 0);

            var creditTotal = api
                .column(3)
                .data()
                .reduce(function (a, b) {
                    return intVal(a) + intVal(b);
                }, 0);

            $('#spnTotalCredit').text(parseFloat(debitTotal).toFixed(2));
            $('#spnTotalDebit').text(parseFloat(creditTotal).toFixed(2));
        }

    });
}
