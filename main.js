var jsonxml = require('jsontoxml');
var dateFormat = require('dateformat');
const fs = require('fs');

const json = {};
json.Header = {};
json.Header.FileDescription = {};
const fd = json.Header.FileDescription;
fd.FileVersion = "";
fd.FileDateCreated = dateFormat(Date.now(), "isoUtcDateTime");
fd.DataType = "";
fd.SoftwareCompanyName = "";
fd.SoftwareName = "";
fd.SoftwareVersion="";
fd.RegistrationNumber="";
fd.NumberOfParts="";
fd.NumberOfParts="";
fd.PartNumber="";
fd.SelectionCriteria ={};
fd.SelectionCriteria.SelectionStartDate = dateFormat(Date.now(),"isoDate");
fd.SelectionCriteria.SelectionEndDate =  dateFormat(Date.now(),"isoDate");

var xml = jsonxml(json);

fs.writeFile("out.xml", xml, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
}); 


