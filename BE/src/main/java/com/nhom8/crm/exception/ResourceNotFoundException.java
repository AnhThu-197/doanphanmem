package com.nhom8.crm.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resource, Integer id) {
        super(resource + " không tồn tại với ID: " + id);
    }
}
