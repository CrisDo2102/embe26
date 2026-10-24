import { describe, expect, it } from "vitest";
import { imagePath, parseCsv, parseDiningCsv } from "./parse";

const csv = '\uFEFF"Mục lớn","Mục nhỏ","Tên quán","Địa chỉ","Món nổi bật","Khoảng giá","Đánh giá","Ảnh bìa","Ảnh bổ sung","Google Maps","Ghi chú"\r\n' +
  '"Tp HCM","Gò vấp","Quán Chay An","12 Lê Lợi","Bún riêu","50.000đ","5","an.jpg","an-2.png|an-3.jpg","https://maps.google.com/a","Rất ngon"\r\n' +
  ',,"Quán số 2",,,, ,,,,\r\n' +
  ',"Bình thạnh",,,,,,,,,\r\n' +
  ',,"Bún Bò",,,,,"bun.png",,,\r\n' +
  '"Bạc Liêu",,"Bánh mì xíu mại","Ngã tư quốc tế",,,,,,,\r\n' +
  '"Đà Lạt","Phường 6","Bánh mì xíu mại",,,,,"banhmi.jpg",,,\r\n';

describe("published dining CSV", () => {
  it("reads quoted values, BOM, commas and newlines", () => {
    expect(parseCsv('\uFEFFa,b\r\n"x,y","z\nq"\r\n')).toEqual([["a","b"],["x,y","z\nq"]]);
    expect(parseCsv('"a""b",c')).toEqual([['a"b','c']]);
  });
  it("inherits merged city and district, changes district, resets when city changes", () => {
    const places = parseDiningCsv(csv);
    expect(places).toHaveLength(5);
    expect(places.map(p => [p.city, p.district, p.name])).toEqual([
      ["Tp HCM", "Gò vấp", "Quán Chay An"],
      ["Tp HCM", "Gò vấp", "Quán số 2"],
      ["Tp HCM", "Bình thạnh", "Bún Bò"],
      ["Bạc Liêu", "Khu vực khác", "Bánh mì xíu mại"],
      ["Đà Lạt", "Phường 6", "Bánh mì xíu mại"],
    ]);
    expect(places[0].photos).toEqual(["/images/di-an/an.jpg", "/images/di-an/an-2.png", "/images/di-an/an-3.jpg"]);
  });
  it("rejects unsafe image paths and script URLs", () => {
    expect(imagePath("../secret.jpg")).toBeNull();
    expect(imagePath("https://example.com/a.jpg")).toBeNull();
    expect(imagePath("a/b.png")).toBeNull();
    expect(imagePath("one.jpg")).toBe("/images/di-an/one.jpg");
    expect(parseDiningCsv("Mục lớn,Mục nhỏ,Tên quán,Google Maps\nHCM,Q1,A,javascript:alert(1)\n")[0].mapsUrl).toBeNull();
  });
  it("ignores merged region-only and blank rows", () => {
    expect(parseDiningCsv("Mục lớn,Mục nhỏ,Tên quán\nHCM,Quận 1,\n,,\n,,Một quán\n")).toHaveLength(1);
  });
  it("reports bad headers instead of silently losing data", () => {
    expect(() => parseDiningCsv("Mục lớn,Mục nhỏ\nHCM,Q1")).toThrow("Tên quán");
  });
});
