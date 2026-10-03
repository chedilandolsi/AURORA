package com.aurora.model.enums;

import lombok.Getter;

@Getter
public enum MaskCategory {
    ABSTRACT(1L, "Abstract", "abstract"),
    ANIMALS(2L, "Animals", "animals"),
    PEOPLE(3L, "People", "people");

    private final Long id;
    private final String displayName;
    private final String slug;

    MaskCategory(Long id, String displayName, String slug) {
        this.id = id;
        this.displayName = displayName;
        this.slug = slug;
    }

    public static boolean isValidCategoryId(Long id) {
        if (id == null) return false;
        for (MaskCategory mc : values()) {
            if (mc.getId().equals(id)) return true;
        }
        return false;
    }
}
