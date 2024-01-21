import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";

createApp({
  data() {
    return {
      apiUrl: "https://ec-course-api.hexschool.io/v2",
      user: {
        username: "",
        password: "",
      },
    };
  },
  methods: {
    async signin() {
      try {
        const res = await axios.post(`${this.apiUrl}/admin/signin`, this.user);
        const { token, expired } = res.data;
        document.cookie = `token=${token}; expires=${new Date(expired)}`;
        location.href = "admin_product.html";
      } catch (error) {
        alert(error.data.message);
      }
    },
  },
}).mount("#app");
