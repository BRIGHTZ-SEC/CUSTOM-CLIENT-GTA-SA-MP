package com.touch.mobile.dark.modules;

import android.app.Activity;
import android.content.Intent;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.touch.mobile.dark.MainGTA;

public class GtaSetupModule extends ReactContextBaseJavaModule {

    ReactApplicationContext context = getReactApplicationContext();

    GtaSetupModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @ReactMethod
    public void startGame(Promise promise) {
        try {
            Activity activity = getCurrentActivity();
            if (activity == null) {
                promise.reject("ACTIVITY_NULL", "Current activity is null");
                return;
            }

            Intent intent = new Intent(activity, MainGTA.class);
            if (activity.getIntent() != null && activity.getIntent().getExtras() != null) {
                intent.putExtras(activity.getIntent().getExtras());
            }
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            activity.startActivity(intent);
            activity.finish();
            promise.resolve(true);

        } catch (Exception e) {
            promise.reject("Error", e);
        }
    }

    @NonNull
    @Override
    public String getName() {
        return "GtaSetupModule";
    }
}
