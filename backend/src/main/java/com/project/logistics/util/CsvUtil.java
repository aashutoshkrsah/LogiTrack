package com.project.logistics.util;

import java.util.List;

public final class CsvUtil {

    private CsvUtil() {
    }

    public static String escape(Object value) {
        if (value == null) {
            return "";
        }
        String s = String.valueOf(value);
        if (s.contains(",") || s.contains("\"") || s.contains("\n") || s.contains("\r")) {
            return "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }

    public static String build(String[] headers, List<String[]> rows) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.join(",", java.util.Arrays.stream(headers).map(CsvUtil::escape).toList()));
        sb.append("\r\n");
        for (String[] row : rows) {
            sb.append(String.join(",", java.util.Arrays.stream(row).map(CsvUtil::escape).toList()));
            sb.append("\r\n");
        }
        return sb.toString();
    }
}
