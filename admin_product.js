import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
import { debounce } from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/+esm";

let productModal;
let delProductModal;
createApp({
  data() {
    return {
      apiUrl: "https://ec-course-api.hexschool.io/v2",
      apiPath: "jiayu",
      products: [],
      tempProduct: {
        imagesUrl: [],
        is_enabled: 0,
      },
      tempIndex: "",
      search: "",
      searchInput: "",
      sortby: "",
      sortDirection: 1,
    };
  },
  mounted() {
    // 驗證
    const AUTH_TOKEN = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    axios.defaults.headers.common["Authorization"] = AUTH_TOKEN;

    this.checkout();

    // modal
    const setStatic = {
      keyboard: false,
      backdrop: "static",
    };
    productModal = new bootstrap.Modal(
      document.querySelector("#productModal"),
      setStatic
    );
    delProductModal = new bootstrap.Modal(
      document.querySelector("#delProductModal"),
      setStatic
    );
  },
  watch: {
    tempProduct() {
      this.tempIndex = this.products.findIndex(
        (item) => item.id === this.tempProduct.id
      );
    },
    // 延遲搜尋
    searchInput: debounce(function (current) {
      this.search = current;
    }, 1000),
  },
  computed: {
    filterProducts() {
      // 搜尋
      let result = [...this.products].filter((item) =>
        item.title.match(this.search)
      );
      // 排序
      result.sort((a, b) =>
        a[this.sortby] > b[this.sortby]
          ? this.sortDirection
          : a[this.sortby] < b[this.sortby]
          ? this.sortDirection * -1
          : 0
      );
      return result;
    },
  },
  methods: {
    openModel(type, product) {
      switch (type) {
        case "new":
          this.tempProduct = {
            imagesUrl: [],
            is_enabled: 0,
          };
          productModal.show();
          break;

        case "edit":
          this.tempProduct = { ...product };
          productModal.show();
          break;

        case "delete":
          this.tempProduct = { ...product };
          delProductModal.show();
      }
    },
    async updateProduct() {
      try {
        const updateData = { data: this.tempProduct };
        // 新增
        let url = `${this.apiUrl}/api/${this.apiPath}/admin/product`;
        let http = "post";
        // 修改
        if (this.tempProduct.id) {
          url += `/${this.tempProduct.id}`;
          http = "put";
        }
        // axios
        const res = await axios[http](url, updateData);
        this.getData();

        productModal.hide();
        alert(res.data.message);
      } catch (error) {
        alert(error.data.message);
      }
    },
    async checkout() {
      try {
        await axios.post(`${this.apiUrl}/api/user/check`);
        this.getData();
      } catch (error) {
        alert(`請重新登入`);
        location.href = "index.html";
      }
    },
    async getData() {
      try {
        const url = `${this.apiUrl}/api/${this.apiPath}/admin/products`;
        const { data } = await axios.get(url);
        this.products = data.products;
      } catch (error) {
        alert(error.data.message);
      }
    },
    async delData() {
      try {
        const url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.tempProduct.id}`;
        const res = await axios.delete(url);
        this.getData();

        delProductModal.hide();
        alert(res.data.message);
      } catch (error) {
        alert(error.data.message);
      }
    },
  },
}).mount("#app");
