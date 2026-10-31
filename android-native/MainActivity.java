package com.brihad.templefinance;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(FileTools.class);
        super.onCreate(savedInstanceState);
    }
}
