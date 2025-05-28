"use strict";
module.exports = {
  formatFile: function () {
    return [
      "jpg",
      "jpeg",
      "pdf",
      "svg",
      "xml",
      "webp",
      "txt",
      "doc",
      "ppt",
      "csv",
      "gif",
    ];
  },
  createdBy: function (user) {
    const userAuth = {
      _id: user._id,
      name: user.name,
    };
    return userAuth;
  },
  typeProfileByDescription(profile) {
    switch (profile) {
      case "ADMINISTRADORA":
        return "5de5730ed5fb4212c0fef89e";
      case "DEPENDENTE":
        return "5de572fed5fb4212c0fef89d";
      case "FORNECEDOR":
        return "5de572f6d5fb4212c0fef89c";
      case "LOCATARIO":
        return "5de572edd5fb4212c0fef89b";
      case "PORTARIA":
        return "5de572dfd5fb4212c0fef89a";
      case "PROCURADOR":
        return "5dcc642295a8c614589b0b6c";
      case "PROPRIETARIO":
        return "5de572bcd5fb4212c0fef899";
      case "PROPRIETARIOINATIVO":
        return "5de57333d5fb4212c0fef8a1";
      case "SINDICO":
        return "5de57318d5fb4212c0fef89f";
      case "SINDPROFISSIONAL":
        return "5df972974ffd8706447eeee6";
      case "ZELADOR":
        return "5de57321d5fb4212c0fef8a0";
      default:
        break;
    }
  },
  typeProfileById(id) {
    switch (id) {
      case "5de5730ed5fb4212c0fef89e":
        return "ADMINISTRADORA";
      case "5de572fed5fb4212c0fef89d":
        return "DEPENDENTE";
      case "5de572f6d5fb4212c0fef89c":
        return "FORNECEDOR";
      case "5de572edd5fb4212c0fef89b":
        return "LOCATARIO";
      case "5de572dfd5fb4212c0fef89a":
        return "PORTARIA";
      case "5dcc642295a8c614589b0b6c":
        return "PROCURADOR";
      case "5de572bcd5fb4212c0fef899":
        return "PROPRIETARIO";
      case "5de57333d5fb4212c0fef8a1":
        return "PROPRIETARIOINATIVO";
      case "5de57318d5fb4212c0fef89f":
        return "SINDICO";
      case "5df972974ffd8706447eeee6":
        return "SINDIPROFISSIONAL";
      case "5de57321d5fb4212c0fef8a0":
        return "ZELADOR";
      default:
        break;
    }
  },
  getFieldsByProfile(profile, request) {
    const description = this.typeProfileById(profile._id) || profile.description;
    switch (description) {
      case "ADMINISTRADORA":
        return request.only(["name", "email", "profile", "password","customer"]);
      case "PROCURADOR":
        return request.only(["name", "email", "profile", "password","customer"]);
      case "PORTARIA":
        return request.only([
          "name",
          "email",
          "profile",
          "phones",
          "doc",
          "otherDoc",
        ]);
      case "LOCATARIO":
        return request.only([
          "name",
          "email",
          "profile",
          "phones",
          "doc",
          "otherDoc",
          "tower",
          "unity",
        ]);
      case "FORNECEDOR":
        return request.only(["name", "email", "profile", "phones"]);
      case "DEPENDENTE":
        return request.only([
          "name",
          "email",
          "profile",
          "phones",
          "doc",
          "otherDoc",
          "unity",
        ]);
      case "SINDICO":
        return request.only([
          "name",
          "email",
          "profile",
          "phones",
          "doc",
          "otherDoc",
          "mandateStart",
          "mandateFinish",
          "electionDate",
        ]);
      case "ZELADOR":
        return request.only(["name", "email", "profile", "phones"]);
      case "SINDIPROFISSIONAL":
        return request.only(["name", "email", "profile", "phones"]);
      case "PROPRIETARIOINATIVO":
        return request.only(["name", "email", "profile", "phones"]);
      case "PROPRIETARIO":
        return request.only([
          "name",
          "email",
          "profile",
          "phones",
          "doc",
          "otherDoc",
          "tower",
          "unity",
          "address",
          " number",
          "complement",
          "neighborhood",
          "city",
          "uf",
        ]);
      default:
        break;
    }
  },
  statusType() {
    return ['Open','Waiting Approval', 'Processing', 'Disapproved',"Finished","Reopen"];
  }
};
